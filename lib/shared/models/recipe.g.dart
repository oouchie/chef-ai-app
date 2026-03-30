// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recipe.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecipeImpl _$$RecipeImplFromJson(Map<String, dynamic> json) => _$RecipeImpl(
  name: json['name'] as String,
  region: json['region'] as String,
  cuisine: json['cuisine'] as String,
  description: json['description'] as String,
  prepTime: json['prepTime'] as String,
  cookTime: json['cookTime'] as String,
  servings: (json['servings'] as num).toInt(),
  difficulty: json['difficulty'] as String,
  ingredients: (json['ingredients'] as List<dynamic>)
      .map((e) => Ingredient.fromJson(e as Map<String, dynamic>))
      .toList(),
  instructions: (json['instructions'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  tips:
      (json['tips'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  tags:
      (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
);

Map<String, dynamic> _$$RecipeImplToJson(_$RecipeImpl instance) =>
    <String, dynamic>{
      'name': instance.name,
      'region': instance.region,
      'cuisine': instance.cuisine,
      'description': instance.description,
      'prepTime': instance.prepTime,
      'cookTime': instance.cookTime,
      'servings': instance.servings,
      'difficulty': instance.difficulty,
      'ingredients': instance.ingredients,
      'instructions': instance.instructions,
      'tips': instance.tips,
      'tags': instance.tags,
    };
