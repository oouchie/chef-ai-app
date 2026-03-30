import 'package:freezed_annotation/freezed_annotation.dart';

import 'recipe.dart';

part 'meal_plan.freezed.dart';
part 'meal_plan.g.dart';

enum MealType { breakfast, lunch, dinner, snack }

enum HealthGoal { weightLoss, muscleBuilding, balanced, lowCarb, heartHealthy }

@freezed
class MealSlot with _$MealSlot {
  const factory MealSlot({
    required MealType type,
    Recipe? recipe,
  }) = _MealSlot;

  factory MealSlot.fromJson(Map<String, dynamic> json) =>
      _$MealSlotFromJson(json);
}

@freezed
class MealDay with _$MealDay {
  const factory MealDay({
    required String dayName,
    required DateTime date,
    @Default([]) List<MealSlot> meals,
  }) = _MealDay;

  factory MealDay.fromJson(Map<String, dynamic> json) =>
      _$MealDayFromJson(json);
}

@freezed
class MealPlan with _$MealPlan {
  const factory MealPlan({
    required List<MealDay> days,
    @Default(HealthGoal.balanced) HealthGoal goal,
  }) = _MealPlan;

  factory MealPlan.fromJson(Map<String, dynamic> json) =>
      _$MealPlanFromJson(json);
}
