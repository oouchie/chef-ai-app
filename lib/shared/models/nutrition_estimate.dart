import 'package:freezed_annotation/freezed_annotation.dart';

part 'nutrition_estimate.freezed.dart';
part 'nutrition_estimate.g.dart';

@freezed
class NutritionEstimate with _$NutritionEstimate {
  const factory NutritionEstimate({
    @Default(0) int calories,
    @Default(0) int protein,
    @Default(0) int carbs,
    @Default(0) int fat,
    @Default(0) int fiber,
  }) = _NutritionEstimate;

  factory NutritionEstimate.fromJson(Map<String, dynamic> json) =>
      _$NutritionEstimateFromJson(json);
}
