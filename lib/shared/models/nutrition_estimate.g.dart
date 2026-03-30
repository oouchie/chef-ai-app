// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'nutrition_estimate.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$NutritionEstimateImpl _$$NutritionEstimateImplFromJson(
  Map<String, dynamic> json,
) => _$NutritionEstimateImpl(
  calories: (json['calories'] as num?)?.toInt() ?? 0,
  protein: (json['protein'] as num?)?.toInt() ?? 0,
  carbs: (json['carbs'] as num?)?.toInt() ?? 0,
  fat: (json['fat'] as num?)?.toInt() ?? 0,
  fiber: (json['fiber'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$NutritionEstimateImplToJson(
  _$NutritionEstimateImpl instance,
) => <String, dynamic>{
  'calories': instance.calories,
  'protein': instance.protein,
  'carbs': instance.carbs,
  'fat': instance.fat,
  'fiber': instance.fiber,
};
