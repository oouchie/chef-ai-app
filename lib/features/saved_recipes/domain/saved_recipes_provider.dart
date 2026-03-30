import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/models.dart';
import '../../../core/services/storage_service.dart';

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
    final recipes = await StorageService.getSavedRecipes();
    state = state.copyWith(recipes: recipes);
  }

  Future<void> _persist() async {
    await StorageService.saveSavedRecipes(state.recipes);
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
    } else {
      state = state.copyWith(recipes: [recipe, ...state.recipes]);
    }

    await _persist();
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
