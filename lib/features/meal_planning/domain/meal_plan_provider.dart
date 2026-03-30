import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/models.dart';
import '../../../core/services/cooking_helpers.dart';

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------
//
// State is MealPlan directly — the model is already a freezed value class,
// which is ideal as a Riverpod state since it is immutable and has copyWith.

class MealPlanNotifier extends StateNotifier<MealPlan> {
  MealPlanNotifier() : super(createEmptyMealPlan());

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /// Places [recipe] in the [MealType] slot for the given [dayIndex].
  /// Replaces any existing recipe in that slot.
  void addRecipeToSlot(int dayIndex, MealType type, Recipe recipe) {
    if (dayIndex < 0 || dayIndex >= state.days.length) return;

    final updatedDays = List<MealDay>.from(state.days);
    final day = updatedDays[dayIndex];

    final updatedMeals = day.meals.map((slot) {
      if (slot.type == type) return slot.copyWith(recipe: recipe);
      return slot;
    }).toList();

    // If the meal type slot did not exist yet, append it.
    final hasSlot = day.meals.any((s) => s.type == type);
    final finalMeals = hasSlot
        ? updatedMeals
        : [...updatedMeals, MealSlot(type: type, recipe: recipe)];

    updatedDays[dayIndex] = day.copyWith(meals: finalMeals);
    state = state.copyWith(days: updatedDays);
  }

  /// Clears the recipe from the [MealType] slot for the given [dayIndex].
  void removeRecipe(int dayIndex, MealType type) {
    if (dayIndex < 0 || dayIndex >= state.days.length) return;

    final updatedDays = List<MealDay>.from(state.days);
    final day = updatedDays[dayIndex];

    final updatedMeals = day.meals.map((slot) {
      if (slot.type == type) return slot.copyWith(recipe: null);
      return slot;
    }).toList();

    updatedDays[dayIndex] = day.copyWith(meals: updatedMeals);
    state = state.copyWith(days: updatedDays);
  }

  void setGoal(HealthGoal goal) {
    state = state.copyWith(goal: goal);
  }

  /// Returns a deduplicated flat list of all ingredients across every filled
  /// meal slot in the plan. Delegates to the shared cooking helper so the
  /// aggregation logic stays in one place.
  List<Ingredient> generateShoppingList() {
    return getShoppingListFromMealPlan(state);
  }

  /// Resets the plan to a fresh empty week, preserving the current goal.
  void resetWeek() {
    state = createEmptyMealPlan().copyWith(goal: state.goal);
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final mealPlanProvider =
    StateNotifierProvider<MealPlanNotifier, MealPlan>(
  (ref) => MealPlanNotifier(),
);

// Convenience derived provider — calories target for the selected goal.
final mealPlanCalorieGoalProvider = Provider<int>((ref) {
  final goal = ref.watch(mealPlanProvider.select((p) => p.goal));
  return healthGoalCalories[goal] ?? 2000;
});
