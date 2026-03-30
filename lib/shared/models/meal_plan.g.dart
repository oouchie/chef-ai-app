// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'meal_plan.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MealSlotImpl _$$MealSlotImplFromJson(Map<String, dynamic> json) =>
    _$MealSlotImpl(
      type: $enumDecode(_$MealTypeEnumMap, json['type']),
      recipe: json['recipe'] == null
          ? null
          : Recipe.fromJson(json['recipe'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$MealSlotImplToJson(_$MealSlotImpl instance) =>
    <String, dynamic>{
      'type': _$MealTypeEnumMap[instance.type]!,
      'recipe': instance.recipe,
    };

const _$MealTypeEnumMap = {
  MealType.breakfast: 'breakfast',
  MealType.lunch: 'lunch',
  MealType.dinner: 'dinner',
  MealType.snack: 'snack',
};

_$MealDayImpl _$$MealDayImplFromJson(Map<String, dynamic> json) =>
    _$MealDayImpl(
      dayName: json['dayName'] as String,
      date: DateTime.parse(json['date'] as String),
      meals:
          (json['meals'] as List<dynamic>?)
              ?.map((e) => MealSlot.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$MealDayImplToJson(_$MealDayImpl instance) =>
    <String, dynamic>{
      'dayName': instance.dayName,
      'date': instance.date.toIso8601String(),
      'meals': instance.meals,
    };

_$MealPlanImpl _$$MealPlanImplFromJson(Map<String, dynamic> json) =>
    _$MealPlanImpl(
      days: (json['days'] as List<dynamic>)
          .map((e) => MealDay.fromJson(e as Map<String, dynamic>))
          .toList(),
      goal:
          $enumDecodeNullable(_$HealthGoalEnumMap, json['goal']) ??
          HealthGoal.balanced,
    );

Map<String, dynamic> _$$MealPlanImplToJson(_$MealPlanImpl instance) =>
    <String, dynamic>{
      'days': instance.days,
      'goal': _$HealthGoalEnumMap[instance.goal]!,
    };

const _$HealthGoalEnumMap = {
  HealthGoal.weightLoss: 'weightLoss',
  HealthGoal.muscleBuilding: 'muscleBuilding',
  HealthGoal.balanced: 'balanced',
  HealthGoal.lowCarb: 'lowCarb',
  HealthGoal.heartHealthy: 'heartHealthy',
};
