// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'meal_plan.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MealSlot _$MealSlotFromJson(Map<String, dynamic> json) {
  return _MealSlot.fromJson(json);
}

/// @nodoc
mixin _$MealSlot {
  MealType get type => throw _privateConstructorUsedError;
  Recipe? get recipe => throw _privateConstructorUsedError;

  /// Serializes this MealSlot to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MealSlot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MealSlotCopyWith<MealSlot> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MealSlotCopyWith<$Res> {
  factory $MealSlotCopyWith(MealSlot value, $Res Function(MealSlot) then) =
      _$MealSlotCopyWithImpl<$Res, MealSlot>;
  @useResult
  $Res call({MealType type, Recipe? recipe});

  $RecipeCopyWith<$Res>? get recipe;
}

/// @nodoc
class _$MealSlotCopyWithImpl<$Res, $Val extends MealSlot>
    implements $MealSlotCopyWith<$Res> {
  _$MealSlotCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MealSlot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? type = null, Object? recipe = freezed}) {
    return _then(
      _value.copyWith(
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as MealType,
            recipe: freezed == recipe
                ? _value.recipe
                : recipe // ignore: cast_nullable_to_non_nullable
                      as Recipe?,
          )
          as $Val,
    );
  }

  /// Create a copy of MealSlot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $RecipeCopyWith<$Res>? get recipe {
    if (_value.recipe == null) {
      return null;
    }

    return $RecipeCopyWith<$Res>(_value.recipe!, (value) {
      return _then(_value.copyWith(recipe: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$MealSlotImplCopyWith<$Res>
    implements $MealSlotCopyWith<$Res> {
  factory _$$MealSlotImplCopyWith(
    _$MealSlotImpl value,
    $Res Function(_$MealSlotImpl) then,
  ) = __$$MealSlotImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({MealType type, Recipe? recipe});

  @override
  $RecipeCopyWith<$Res>? get recipe;
}

/// @nodoc
class __$$MealSlotImplCopyWithImpl<$Res>
    extends _$MealSlotCopyWithImpl<$Res, _$MealSlotImpl>
    implements _$$MealSlotImplCopyWith<$Res> {
  __$$MealSlotImplCopyWithImpl(
    _$MealSlotImpl _value,
    $Res Function(_$MealSlotImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MealSlot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? type = null, Object? recipe = freezed}) {
    return _then(
      _$MealSlotImpl(
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as MealType,
        recipe: freezed == recipe
            ? _value.recipe
            : recipe // ignore: cast_nullable_to_non_nullable
                  as Recipe?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MealSlotImpl implements _MealSlot {
  const _$MealSlotImpl({required this.type, this.recipe});

  factory _$MealSlotImpl.fromJson(Map<String, dynamic> json) =>
      _$$MealSlotImplFromJson(json);

  @override
  final MealType type;
  @override
  final Recipe? recipe;

  @override
  String toString() {
    return 'MealSlot(type: $type, recipe: $recipe)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MealSlotImpl &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.recipe, recipe) || other.recipe == recipe));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, type, recipe);

  /// Create a copy of MealSlot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MealSlotImplCopyWith<_$MealSlotImpl> get copyWith =>
      __$$MealSlotImplCopyWithImpl<_$MealSlotImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MealSlotImplToJson(this);
  }
}

abstract class _MealSlot implements MealSlot {
  const factory _MealSlot({
    required final MealType type,
    final Recipe? recipe,
  }) = _$MealSlotImpl;

  factory _MealSlot.fromJson(Map<String, dynamic> json) =
      _$MealSlotImpl.fromJson;

  @override
  MealType get type;
  @override
  Recipe? get recipe;

  /// Create a copy of MealSlot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MealSlotImplCopyWith<_$MealSlotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MealDay _$MealDayFromJson(Map<String, dynamic> json) {
  return _MealDay.fromJson(json);
}

/// @nodoc
mixin _$MealDay {
  String get dayName => throw _privateConstructorUsedError;
  DateTime get date => throw _privateConstructorUsedError;
  List<MealSlot> get meals => throw _privateConstructorUsedError;

  /// Serializes this MealDay to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MealDay
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MealDayCopyWith<MealDay> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MealDayCopyWith<$Res> {
  factory $MealDayCopyWith(MealDay value, $Res Function(MealDay) then) =
      _$MealDayCopyWithImpl<$Res, MealDay>;
  @useResult
  $Res call({String dayName, DateTime date, List<MealSlot> meals});
}

/// @nodoc
class _$MealDayCopyWithImpl<$Res, $Val extends MealDay>
    implements $MealDayCopyWith<$Res> {
  _$MealDayCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MealDay
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? dayName = null,
    Object? date = null,
    Object? meals = null,
  }) {
    return _then(
      _value.copyWith(
            dayName: null == dayName
                ? _value.dayName
                : dayName // ignore: cast_nullable_to_non_nullable
                      as String,
            date: null == date
                ? _value.date
                : date // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            meals: null == meals
                ? _value.meals
                : meals // ignore: cast_nullable_to_non_nullable
                      as List<MealSlot>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MealDayImplCopyWith<$Res> implements $MealDayCopyWith<$Res> {
  factory _$$MealDayImplCopyWith(
    _$MealDayImpl value,
    $Res Function(_$MealDayImpl) then,
  ) = __$$MealDayImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String dayName, DateTime date, List<MealSlot> meals});
}

/// @nodoc
class __$$MealDayImplCopyWithImpl<$Res>
    extends _$MealDayCopyWithImpl<$Res, _$MealDayImpl>
    implements _$$MealDayImplCopyWith<$Res> {
  __$$MealDayImplCopyWithImpl(
    _$MealDayImpl _value,
    $Res Function(_$MealDayImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MealDay
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? dayName = null,
    Object? date = null,
    Object? meals = null,
  }) {
    return _then(
      _$MealDayImpl(
        dayName: null == dayName
            ? _value.dayName
            : dayName // ignore: cast_nullable_to_non_nullable
                  as String,
        date: null == date
            ? _value.date
            : date // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        meals: null == meals
            ? _value._meals
            : meals // ignore: cast_nullable_to_non_nullable
                  as List<MealSlot>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MealDayImpl implements _MealDay {
  const _$MealDayImpl({
    required this.dayName,
    required this.date,
    final List<MealSlot> meals = const [],
  }) : _meals = meals;

  factory _$MealDayImpl.fromJson(Map<String, dynamic> json) =>
      _$$MealDayImplFromJson(json);

  @override
  final String dayName;
  @override
  final DateTime date;
  final List<MealSlot> _meals;
  @override
  @JsonKey()
  List<MealSlot> get meals {
    if (_meals is EqualUnmodifiableListView) return _meals;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_meals);
  }

  @override
  String toString() {
    return 'MealDay(dayName: $dayName, date: $date, meals: $meals)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MealDayImpl &&
            (identical(other.dayName, dayName) || other.dayName == dayName) &&
            (identical(other.date, date) || other.date == date) &&
            const DeepCollectionEquality().equals(other._meals, _meals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    dayName,
    date,
    const DeepCollectionEquality().hash(_meals),
  );

  /// Create a copy of MealDay
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MealDayImplCopyWith<_$MealDayImpl> get copyWith =>
      __$$MealDayImplCopyWithImpl<_$MealDayImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MealDayImplToJson(this);
  }
}

abstract class _MealDay implements MealDay {
  const factory _MealDay({
    required final String dayName,
    required final DateTime date,
    final List<MealSlot> meals,
  }) = _$MealDayImpl;

  factory _MealDay.fromJson(Map<String, dynamic> json) = _$MealDayImpl.fromJson;

  @override
  String get dayName;
  @override
  DateTime get date;
  @override
  List<MealSlot> get meals;

  /// Create a copy of MealDay
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MealDayImplCopyWith<_$MealDayImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MealPlan _$MealPlanFromJson(Map<String, dynamic> json) {
  return _MealPlan.fromJson(json);
}

/// @nodoc
mixin _$MealPlan {
  List<MealDay> get days => throw _privateConstructorUsedError;
  HealthGoal get goal => throw _privateConstructorUsedError;

  /// Serializes this MealPlan to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MealPlan
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MealPlanCopyWith<MealPlan> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MealPlanCopyWith<$Res> {
  factory $MealPlanCopyWith(MealPlan value, $Res Function(MealPlan) then) =
      _$MealPlanCopyWithImpl<$Res, MealPlan>;
  @useResult
  $Res call({List<MealDay> days, HealthGoal goal});
}

/// @nodoc
class _$MealPlanCopyWithImpl<$Res, $Val extends MealPlan>
    implements $MealPlanCopyWith<$Res> {
  _$MealPlanCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MealPlan
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? days = null, Object? goal = null}) {
    return _then(
      _value.copyWith(
            days: null == days
                ? _value.days
                : days // ignore: cast_nullable_to_non_nullable
                      as List<MealDay>,
            goal: null == goal
                ? _value.goal
                : goal // ignore: cast_nullable_to_non_nullable
                      as HealthGoal,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MealPlanImplCopyWith<$Res>
    implements $MealPlanCopyWith<$Res> {
  factory _$$MealPlanImplCopyWith(
    _$MealPlanImpl value,
    $Res Function(_$MealPlanImpl) then,
  ) = __$$MealPlanImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<MealDay> days, HealthGoal goal});
}

/// @nodoc
class __$$MealPlanImplCopyWithImpl<$Res>
    extends _$MealPlanCopyWithImpl<$Res, _$MealPlanImpl>
    implements _$$MealPlanImplCopyWith<$Res> {
  __$$MealPlanImplCopyWithImpl(
    _$MealPlanImpl _value,
    $Res Function(_$MealPlanImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MealPlan
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? days = null, Object? goal = null}) {
    return _then(
      _$MealPlanImpl(
        days: null == days
            ? _value._days
            : days // ignore: cast_nullable_to_non_nullable
                  as List<MealDay>,
        goal: null == goal
            ? _value.goal
            : goal // ignore: cast_nullable_to_non_nullable
                  as HealthGoal,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MealPlanImpl implements _MealPlan {
  const _$MealPlanImpl({
    required final List<MealDay> days,
    this.goal = HealthGoal.balanced,
  }) : _days = days;

  factory _$MealPlanImpl.fromJson(Map<String, dynamic> json) =>
      _$$MealPlanImplFromJson(json);

  final List<MealDay> _days;
  @override
  List<MealDay> get days {
    if (_days is EqualUnmodifiableListView) return _days;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_days);
  }

  @override
  @JsonKey()
  final HealthGoal goal;

  @override
  String toString() {
    return 'MealPlan(days: $days, goal: $goal)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MealPlanImpl &&
            const DeepCollectionEquality().equals(other._days, _days) &&
            (identical(other.goal, goal) || other.goal == goal));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_days),
    goal,
  );

  /// Create a copy of MealPlan
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MealPlanImplCopyWith<_$MealPlanImpl> get copyWith =>
      __$$MealPlanImplCopyWithImpl<_$MealPlanImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MealPlanImplToJson(this);
  }
}

abstract class _MealPlan implements MealPlan {
  const factory _MealPlan({
    required final List<MealDay> days,
    final HealthGoal goal,
  }) = _$MealPlanImpl;

  factory _MealPlan.fromJson(Map<String, dynamic> json) =
      _$MealPlanImpl.fromJson;

  @override
  List<MealDay> get days;
  @override
  HealthGoal get goal;

  /// Create a copy of MealPlan
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MealPlanImplCopyWith<_$MealPlanImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
