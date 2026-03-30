// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'nutrition_estimate.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

NutritionEstimate _$NutritionEstimateFromJson(Map<String, dynamic> json) {
  return _NutritionEstimate.fromJson(json);
}

/// @nodoc
mixin _$NutritionEstimate {
  int get calories => throw _privateConstructorUsedError;
  int get protein => throw _privateConstructorUsedError;
  int get carbs => throw _privateConstructorUsedError;
  int get fat => throw _privateConstructorUsedError;
  int get fiber => throw _privateConstructorUsedError;

  /// Serializes this NutritionEstimate to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NutritionEstimate
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NutritionEstimateCopyWith<NutritionEstimate> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NutritionEstimateCopyWith<$Res> {
  factory $NutritionEstimateCopyWith(
    NutritionEstimate value,
    $Res Function(NutritionEstimate) then,
  ) = _$NutritionEstimateCopyWithImpl<$Res, NutritionEstimate>;
  @useResult
  $Res call({int calories, int protein, int carbs, int fat, int fiber});
}

/// @nodoc
class _$NutritionEstimateCopyWithImpl<$Res, $Val extends NutritionEstimate>
    implements $NutritionEstimateCopyWith<$Res> {
  _$NutritionEstimateCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NutritionEstimate
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? calories = null,
    Object? protein = null,
    Object? carbs = null,
    Object? fat = null,
    Object? fiber = null,
  }) {
    return _then(
      _value.copyWith(
            calories: null == calories
                ? _value.calories
                : calories // ignore: cast_nullable_to_non_nullable
                      as int,
            protein: null == protein
                ? _value.protein
                : protein // ignore: cast_nullable_to_non_nullable
                      as int,
            carbs: null == carbs
                ? _value.carbs
                : carbs // ignore: cast_nullable_to_non_nullable
                      as int,
            fat: null == fat
                ? _value.fat
                : fat // ignore: cast_nullable_to_non_nullable
                      as int,
            fiber: null == fiber
                ? _value.fiber
                : fiber // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NutritionEstimateImplCopyWith<$Res>
    implements $NutritionEstimateCopyWith<$Res> {
  factory _$$NutritionEstimateImplCopyWith(
    _$NutritionEstimateImpl value,
    $Res Function(_$NutritionEstimateImpl) then,
  ) = __$$NutritionEstimateImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int calories, int protein, int carbs, int fat, int fiber});
}

/// @nodoc
class __$$NutritionEstimateImplCopyWithImpl<$Res>
    extends _$NutritionEstimateCopyWithImpl<$Res, _$NutritionEstimateImpl>
    implements _$$NutritionEstimateImplCopyWith<$Res> {
  __$$NutritionEstimateImplCopyWithImpl(
    _$NutritionEstimateImpl _value,
    $Res Function(_$NutritionEstimateImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NutritionEstimate
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? calories = null,
    Object? protein = null,
    Object? carbs = null,
    Object? fat = null,
    Object? fiber = null,
  }) {
    return _then(
      _$NutritionEstimateImpl(
        calories: null == calories
            ? _value.calories
            : calories // ignore: cast_nullable_to_non_nullable
                  as int,
        protein: null == protein
            ? _value.protein
            : protein // ignore: cast_nullable_to_non_nullable
                  as int,
        carbs: null == carbs
            ? _value.carbs
            : carbs // ignore: cast_nullable_to_non_nullable
                  as int,
        fat: null == fat
            ? _value.fat
            : fat // ignore: cast_nullable_to_non_nullable
                  as int,
        fiber: null == fiber
            ? _value.fiber
            : fiber // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NutritionEstimateImpl implements _NutritionEstimate {
  const _$NutritionEstimateImpl({
    this.calories = 0,
    this.protein = 0,
    this.carbs = 0,
    this.fat = 0,
    this.fiber = 0,
  });

  factory _$NutritionEstimateImpl.fromJson(Map<String, dynamic> json) =>
      _$$NutritionEstimateImplFromJson(json);

  @override
  @JsonKey()
  final int calories;
  @override
  @JsonKey()
  final int protein;
  @override
  @JsonKey()
  final int carbs;
  @override
  @JsonKey()
  final int fat;
  @override
  @JsonKey()
  final int fiber;

  @override
  String toString() {
    return 'NutritionEstimate(calories: $calories, protein: $protein, carbs: $carbs, fat: $fat, fiber: $fiber)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NutritionEstimateImpl &&
            (identical(other.calories, calories) ||
                other.calories == calories) &&
            (identical(other.protein, protein) || other.protein == protein) &&
            (identical(other.carbs, carbs) || other.carbs == carbs) &&
            (identical(other.fat, fat) || other.fat == fat) &&
            (identical(other.fiber, fiber) || other.fiber == fiber));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, calories, protein, carbs, fat, fiber);

  /// Create a copy of NutritionEstimate
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NutritionEstimateImplCopyWith<_$NutritionEstimateImpl> get copyWith =>
      __$$NutritionEstimateImplCopyWithImpl<_$NutritionEstimateImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$NutritionEstimateImplToJson(this);
  }
}

abstract class _NutritionEstimate implements NutritionEstimate {
  const factory _NutritionEstimate({
    final int calories,
    final int protein,
    final int carbs,
    final int fat,
    final int fiber,
  }) = _$NutritionEstimateImpl;

  factory _NutritionEstimate.fromJson(Map<String, dynamic> json) =
      _$NutritionEstimateImpl.fromJson;

  @override
  int get calories;
  @override
  int get protein;
  @override
  int get carbs;
  @override
  int get fat;
  @override
  int get fiber;

  /// Create a copy of NutritionEstimate
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NutritionEstimateImplCopyWith<_$NutritionEstimateImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
