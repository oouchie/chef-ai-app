import 'package:freezed_annotation/freezed_annotation.dart';

import 'ingredient.dart';

part 'recipe.freezed.dart';
part 'recipe.g.dart';

@freezed
class Recipe with _$Recipe {
  const factory Recipe({
    required String name,
    required String region,
    required String cuisine,
    required String description,
    required String prepTime,
    required String cookTime,
    required int servings,
    required String difficulty,
    required List<Ingredient> ingredients,
    required List<String> instructions,
    @Default([]) List<String> tips,
    @Default([]) List<String> tags,
  }) = _Recipe;

  factory Recipe.fromJson(Map<String, dynamic> json) =>
      _$RecipeFromJson(json);
}
