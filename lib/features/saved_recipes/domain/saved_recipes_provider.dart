import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/models.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/supabase_service.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

class SavedRecipesState {
  final List<Recipe> recipes;
  final String searchQuery;
  final String? regionFilter;
  final String? difficultyFilter;

  const SavedRecipesState({
    this.recipes = const [],
    this.searchQuery = '',
    this.regionFilter,
    this.difficultyFilter,
  });

  SavedRecipesState copyWith({
    List<Recipe>? recipes,
    String? searchQuery,
    String? regionFilter,
    String? difficultyFilter,
    bool clearRegionFilter = false,
    bool clearDifficultyFilter = false,
  }) {
    return SavedRecipesState(
      recipes: recipes ?? this.recipes,
      searchQuery: searchQuery ?? this.searchQuery,
      regionFilter:
          clearRegionFilter ? null : (regionFilter ?? this.regionFilter),
      difficultyFilter: clearDifficultyFilter
          ? null
          : (difficultyFilter ?? this.difficultyFilter),
    );
  }

  List<Recipe> get filteredRecipes {
    var result = recipes;

    if (searchQuery.isNotEmpty) {
      final query = searchQuery.toLowerCase();
      result = result
          .where((r) =>
              r.name.toLowerCase().contains(query) ||
              r.cuisine.toLowerCase().contains(query) ||
              r.description.toLowerCase().contains(query) ||
              r.tags.any((t) => t.toLowerCase().contains(query)))
          .toList();
    }

    if (regionFilter != null && regionFilter!.isNotEmpty) {
      result =
          result.where((r) => r.region == regionFilter).toList();
    }

    if (difficultyFilter != null && difficultyFilter!.isNotEmpty) {
      result = result
          .where((r) =>
              r.difficulty.toLowerCase() == difficultyFilter!.toLowerCase())
          .toList();
    }

    return result;
  }

  bool isSaved(Recipe recipe) =>
      recipes.any((r) => r.name == recipe.name && r.cuisine == recipe.cuisine);
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class SavedRecipesNotifier extends StateNotifier<SavedRecipesState> {
  SavedRecipesNotifier() : super(const SavedRecipesState()) {
    _load();
  }

  Future<void> _load() async {
    // Load local first (instant, works offline)
    final localRecipes = await StorageService.getSavedRecipes();
    state = state.copyWith(recipes: localRecipes);

    // If logged in, fetch cloud and merge
    if (SupabaseService.isLoggedIn) {
      try {
        final cloudRecipes = await SupabaseService.getSavedRecipes();

        final merged = _mergeRecipes(cloudRecipes, localRecipes);
        state = state.copyWith(recipes: merged);
        await StorageService.saveSavedRecipes(merged);

        // Upload any local-only recipes to cloud (first-launch migration)
        final cloudKeys =
            cloudRecipes.map((r) => '${r.name}||${r.cuisine}').toSet();
        final localOnly =
            merged.where((r) => !cloudKeys.contains('${r.name}||${r.cuisine}'));
        for (final recipe in localOnly) {
          await SupabaseService.saveRecipe(recipe);
        }
      } catch (e) {
        // Cloud fetch failed — local recipes already loaded
      }
    }
  }

  /// Merges two recipe lists, deduplicating by name+cuisine.
  /// Cloud recipes take precedence.
  List<Recipe> _mergeRecipes(List<Recipe> cloud, List<Recipe> local) {
    final seen = <String>{};
    final merged = <Recipe>[];

    for (final recipe in [...cloud, ...local]) {
      final key = '${recipe.name}||${recipe.cuisine}';
      if (seen.add(key)) {
        merged.add(recipe);
      }
    }

    return merged;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  Future<void> toggleSave(Recipe recipe) async {
    final alreadySaved = state.isSaved(recipe);

    if (alreadySaved) {
      state = state.copyWith(
        recipes: state.recipes
            .where((r) =>
                !(r.name == recipe.name && r.cuisine == recipe.cuisine))
            .toList(),
      );
      await StorageService.saveSavedRecipes(state.recipes);
      await SupabaseService.deleteRecipe(recipe);
    } else {
      state = state.copyWith(recipes: [recipe, ...state.recipes]);
      await StorageService.saveSavedRecipes(state.recipes);
      await SupabaseService.saveRecipe(recipe);
    }
  }

  void setSearch(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setRegionFilter(String? region) {
    if (region == null) {
      state = state.copyWith(clearRegionFilter: true);
    } else {
      state = state.copyWith(regionFilter: region);
    }
  }

  void setDifficultyFilter(String? difficulty) {
    if (difficulty == null) {
      state = state.copyWith(clearDifficultyFilter: true);
    } else {
      state = state.copyWith(difficultyFilter: difficulty);
    }
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final savedRecipesProvider =
    StateNotifierProvider<SavedRecipesNotifier, SavedRecipesState>(
  (ref) => SavedRecipesNotifier(),
);
