import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/saved_recipes_provider.dart';
import '../../../shared/models/models.dart';
import '../../../shared/utils/shopping_list_helpers.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/constants/regions.dart';

class SavedRecipesScreen extends ConsumerWidget {
  const SavedRecipesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(savedRecipesProvider);
    final notifier = ref.read(savedRecipesProvider.notifier);
    final filtered = state.filteredRecipes;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Recipes'),
        centerTitle: false,
        elevation: 0,
      ),
      body: Column(
        children: [
          _SearchBar(
            onChanged: notifier.setSearch,
            initialValue: state.searchQuery,
          ),
          _FilterRow(
            selectedRegion: state.regionFilter,
            selectedDifficulty: state.difficultyFilter,
            onRegionChanged: notifier.setRegionFilter,
            onDifficultyChanged: notifier.setDifficultyFilter,
          ),
          Expanded(
            child: filtered.isEmpty
                ? _EmptyState(hasRecipes: state.recipes.isNotEmpty)
                : _RecipeList(
                    recipes: filtered,
                    savedState: state,
                    notifier: notifier,
                    ref: ref,
                    groupByRegion: state.regionFilter == null &&
                        state.searchQuery.isEmpty &&
                        state.difficultyFilter == null,
                  ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Search bar
// ---------------------------------------------------------------------------

class _SearchBar extends StatefulWidget {
  const _SearchBar({required this.onChanged, required this.initialValue});

  final ValueChanged<String> onChanged;
  final String initialValue;

  @override
  State<_SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<_SearchBar> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: TextField(
        controller: _controller,
        onChanged: widget.onChanged,
        decoration: InputDecoration(
          hintText: 'Search recipes, cuisines, tags...',
          prefixIcon: const Icon(Icons.search, size: 20),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 18),
                  onPressed: () {
                    _controller.clear();
                    widget.onChanged('');
                  },
                )
              : null,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          filled: true,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Filter row
// ---------------------------------------------------------------------------

class _FilterRow extends StatelessWidget {
  const _FilterRow({
    required this.selectedRegion,
    required this.selectedDifficulty,
    required this.onRegionChanged,
    required this.onDifficultyChanged,
  });

  final String? selectedRegion;
  final String? selectedDifficulty;
  final ValueChanged<String?> onRegionChanged;
  final ValueChanged<String?> onDifficultyChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        children: [
          // All regions chip
          _FilterChipItem(
            label: 'All Regions',
            selected: selectedRegion == null,
            onSelected: (_) => onRegionChanged(null),
          ),
          const SizedBox(width: 6),
          // Region chips
          ...worldRegions.map((r) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: _FilterChipItem(
                  label: '${r.flag} ${r.name}',
                  selected: selectedRegion == r.id,
                  onSelected: (_) => onRegionChanged(
                    selectedRegion == r.id ? null : r.id,
                  ),
                ),
              )),
          Container(
            width: 1,
            height: 28,
            color: Theme.of(context).dividerColor,
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          ),
          // Difficulty chips
          for (final diff in ['Easy', 'Medium', 'Hard']) ...[
            _FilterChipItem(
              label: diff,
              selected: selectedDifficulty == diff,
              onSelected: (_) => onDifficultyChanged(
                selectedDifficulty == diff ? null : diff,
              ),
            ),
            const SizedBox(width: 6),
          ],
        ],
      ),
    );
  }
}

class _FilterChipItem extends StatelessWidget {
  const _FilterChipItem({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final ValueChanged<bool> onSelected;

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label, style: const TextStyle(fontSize: 12)),
      selected: selected,
      onSelected: onSelected,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      visualDensity: VisualDensity.compact,
    );
  }
}

// ---------------------------------------------------------------------------
// Recipe list (grouped or flat)
// ---------------------------------------------------------------------------

class _RecipeList extends StatelessWidget {
  const _RecipeList({
    required this.recipes,
    required this.savedState,
    required this.notifier,
    required this.ref,
    required this.groupByRegion,
  });

  final List<Recipe> recipes;
  final SavedRecipesState savedState;
  final SavedRecipesNotifier notifier;
  final WidgetRef ref;
  final bool groupByRegion;

  @override
  Widget build(BuildContext context) {
    if (!groupByRegion || recipes.isEmpty) {
      return ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: recipes.length,
        itemBuilder: (context, index) => _buildRecipeCard(context, recipes[index]),
      );
    }

    // Group by region
    final grouped = <String, List<Recipe>>{};
    for (final r in recipes) {
      grouped.putIfAbsent(r.region, () => []).add(r);
    }

    final items = <Widget>[];
    for (final entry in grouped.entries) {
      final regionId = entry.key;
      final regionInfo = worldRegions.cast<RegionInfo?>().firstWhere(
            (r) => r?.id == regionId,
            orElse: () => null,
          );
      final label = regionInfo != null
          ? '${regionInfo.flag} ${regionInfo.name}'
          : regionId;

      items.add(_SectionHeader(label: label));
      for (final recipe in entry.value) {
        items.add(_buildRecipeCard(context, recipe));
      }
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: items,
    );
  }

  Widget _buildRecipeCard(BuildContext context, Recipe recipe) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: RecipeCard(
        recipe: recipe,
        isSaved: savedState.isSaved(recipe),
        onSave: () => notifier.toggleSave(recipe),
        onAddToShoppingList: () {
          showAddToShoppingList(
            context: context,
            ref: ref,
            recipe: recipe,
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 6),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.hasRecipes});

  final bool hasRecipes;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              hasRecipes ? Icons.search_off : Icons.bookmark_outline,
              size: 72,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              hasRecipes ? 'No recipes match your filters' : 'No saved recipes yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              hasRecipes
                  ? 'Try adjusting your search or clearing the filters.'
                  : 'Go to the Home tab, ask for a recipe, and tap the heart to save it here.',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
