// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recipe.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Recipe _$RecipeFromJson(Map<String, dynamic> json) {
  return _Recipe.fromJson(json);
}

/// @nodoc
mixin _$Recipe {
  String get name => throw _privateConstructorUsedError;
  String get region => throw _privateConstructorUsedError;
  String get cuisine => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get prepTime => throw _privateConstructorUsedError;
  String get cookTime => throw _privateConstructorUsedError;
  int get servings => throw _privateConstructorUsedError;
  String get difficulty => throw _privateConstructorUsedError;
  List<Ingredient> get ingredients => throw _privateConstructorUsedError;
  List<String> get instructions => throw _privateConstructorUsedError;
  List<String> get tips => throw _privateConstructorUsedError;
  List<String> get tags => throw _privateConstructorUsedError;

  /// Serializes this Recipe to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Recipe
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecipeCopyWith<Recipe> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecipeCopyWith<$Res> {
  factory $RecipeCopyWith(Recipe value, $Res Function(Recipe) then) =
      _$RecipeCopyWithImpl<$Res, Recipe>;
  @useResult
  $Res call({
    String name,
    String region,
    String cuisine,
    String description,
    String prepTime,
    String cookTime,
    int servings,
    String difficulty,
    List<Ingredient> ingredients,
    List<String> instructions,
    List<String> tips,
    List<String> tags,
  });
}

/// @nodoc
class _$RecipeCopyWithImpl<$Res, $Val extends Recipe>
    implements $RecipeCopyWith<$Res> {
  _$RecipeCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Recipe
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? region = null,
    Object? cuisine = null,
    Object? description = null,
    Object? prepTime = null,
    Object? cookTime = null,
    Object? servings = null,
    Object? difficulty = null,
    Object? ingredients = null,
    Object? instructions = null,
    Object? tips = null,
    Object? tags = null,
  }) {
    return _then(
      _value.copyWith(
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            region: null == region
                ? _value.region
                : region // ignore: cast_nullable_to_non_nullable
                      as String,
            cuisine: null == cuisine
                ? _value.cuisine
                : cuisine // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            prepTime: null == prepTime
                ? _value.prepTime
                : prepTime // ignore: cast_nullable_to_non_nullable
                      as String,
            cookTime: null == cookTime
                ? _value.cookTime
                : cookTime // ignore: cast_nullable_to_non_nullable
                      as String,
            servings: null == servings
                ? _value.servings
                : servings // ignore: cast_nullable_to_non_nullable
                      as int,
            difficulty: null == difficulty
                ? _value.difficulty
                : difficulty // ignore: cast_nullable_to_non_nullable
                      as String,
            ingredients: null == ingredients
                ? _value.ingredients
                : ingredients // ignore: cast_nullable_to_non_nullable
                      as List<Ingredient>,
            instructions: null == instructions
                ? _value.instructions
                : instructions // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            tips: null == tips
                ? _value.tips
                : tips // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            tags: null == tags
                ? _value.tags
                : tags // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RecipeImplCopyWith<$Res> implements $RecipeCopyWith<$Res> {
  factory _$$RecipeImplCopyWith(
    _$RecipeImpl value,
    $Res Function(_$RecipeImpl) then,
  ) = __$$RecipeImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String name,
    String region,
    String cuisine,
    String description,
    String prepTime,
    String cookTime,
    int servings,
    String difficulty,
    List<Ingredient> ingredients,
    List<String> instructions,
    List<String> tips,
    List<String> tags,
  });
}

/// @nodoc
class __$$RecipeImplCopyWithImpl<$Res>
    extends _$RecipeCopyWithImpl<$Res, _$RecipeImpl>
    implements _$$RecipeImplCopyWith<$Res> {
  __$$RecipeImplCopyWithImpl(
    _$RecipeImpl _value,
    $Res Function(_$RecipeImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Recipe
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? region = null,
    Object? cuisine = null,
    Object? description = null,
    Object? prepTime = null,
    Object? cookTime = null,
    Object? servings = null,
    Object? difficulty = null,
    Object? ingredients = null,
    Object? instructions = null,
    Object? tips = null,
    Object? tags = null,
  }) {
    return _then(
      _$RecipeImpl(
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        region: null == region
            ? _value.region
            : region // ignore: cast_nullable_to_non_nullable
                  as String,
        cuisine: null == cuisine
            ? _value.cuisine
            : cuisine // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        prepTime: null == prepTime
            ? _value.prepTime
            : prepTime // ignore: cast_nullable_to_non_nullable
                  as String,
        cookTime: null == cookTime
            ? _value.cookTime
            : cookTime // ignore: cast_nullable_to_non_nullable
                  as String,
        servings: null == servings
            ? _value.servings
            : servings // ignore: cast_nullable_to_non_nullable
                  as int,
        difficulty: null == difficulty
            ? _value.difficulty
            : difficulty // ignore: cast_nullable_to_non_nullable
                  as String,
        ingredients: null == ingredients
            ? _value._ingredients
            : ingredients // ignore: cast_nullable_to_non_nullable
                  as List<Ingredient>,
        instructions: null == instructions
            ? _value._instructions
            : instructions // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        tips: null == tips
            ? _value._tips
            : tips // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        tags: null == tags
            ? _value._tags
            : tags // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RecipeImpl implements _Recipe {
  const _$RecipeImpl({
    required this.name,
    required this.region,
    required this.cuisine,
    required this.description,
    required this.prepTime,
    required this.cookTime,
    required this.servings,
    required this.difficulty,
    required final List<Ingredient> ingredients,
    required final List<String> instructions,
    final List<String> tips = const [],
    final List<String> tags = const [],
  }) : _ingredients = ingredients,
       _instructions = instructions,
       _tips = tips,
       _tags = tags;

  factory _$RecipeImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecipeImplFromJson(json);

  @override
  final String name;
  @override
  final String region;
  @override
  final String cuisine;
  @override
  final String description;
  @override
  final String prepTime;
  @override
  final String cookTime;
  @override
  final int servings;
  @override
  final String difficulty;
  final List<Ingredient> _ingredients;
  @override
  List<Ingredient> get ingredients {
    if (_ingredients is EqualUnmodifiableListView) return _ingredients;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_ingredients);
  }

  final List<String> _instructions;
  @override
  List<String> get instructions {
    if (_instructions is EqualUnmodifiableListView) return _instructions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_instructions);
  }

  final List<String> _tips;
  @override
  @JsonKey()
  List<String> get tips {
    if (_tips is EqualUnmodifiableListView) return _tips;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tips);
  }

  final List<String> _tags;
  @override
  @JsonKey()
  List<String> get tags {
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_tags);
  }

  @override
  String toString() {
    return 'Recipe(name: $name, region: $region, cuisine: $cuisine, description: $description, prepTime: $prepTime, cookTime: $cookTime, servings: $servings, difficulty: $difficulty, ingredients: $ingredients, instructions: $instructions, tips: $tips, tags: $tags)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecipeImpl &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.region, region) || other.region == region) &&
            (identical(other.cuisine, cuisine) || other.cuisine == cuisine) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.prepTime, prepTime) ||
                other.prepTime == prepTime) &&
            (identical(other.cookTime, cookTime) ||
                other.cookTime == cookTime) &&
            (identical(other.servings, servings) ||
                other.servings == servings) &&
            (identical(other.difficulty, difficulty) ||
                other.difficulty == difficulty) &&
            const DeepCollectionEquality().equals(
              other._ingredients,
              _ingredients,
            ) &&
            const DeepCollectionEquality().equals(
              other._instructions,
              _instructions,
            ) &&
            const DeepCollectionEquality().equals(other._tips, _tips) &&
            const DeepCollectionEquality().equals(other._tags, _tags));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    name,
    region,
    cuisine,
    description,
    prepTime,
    cookTime,
    servings,
    difficulty,
    const DeepCollectionEquality().hash(_ingredients),
    const DeepCollectionEquality().hash(_instructions),
    const DeepCollectionEquality().hash(_tips),
    const DeepCollectionEquality().hash(_tags),
  );

  /// Create a copy of Recipe
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecipeImplCopyWith<_$RecipeImpl> get copyWith =>
      __$$RecipeImplCopyWithImpl<_$RecipeImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RecipeImplToJson(this);
  }
}

abstract class _Recipe implements Recipe {
  const factory _Recipe({
    required final String name,
    required final String region,
    required final String cuisine,
    required final String description,
    required final String prepTime,
    required final String cookTime,
    required final int servings,
    required final String difficulty,
    required final List<Ingredient> ingredients,
    required final List<String> instructions,
    final List<String> tips,
    final List<String> tags,
  }) = _$RecipeImpl;

  factory _Recipe.fromJson(Map<String, dynamic> json) = _$RecipeImpl.fromJson;

  @override
  String get name;
  @override
  String get region;
  @override
  String get cuisine;
  @override
  String get description;
  @override
  String get prepTime;
  @override
  String get cookTime;
  @override
  int get servings;
  @override
  String get difficulty;
  @override
  List<Ingredient> get ingredients;
  @override
  List<String> get instructions;
  @override
  List<String> get tips;
  @override
  List<String> get tags;

  /// Create a copy of Recipe
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecipeImplCopyWith<_$RecipeImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
