// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'todo_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

TodoItem _$TodoItemFromJson(Map<String, dynamic> json) {
  return _TodoItem.fromJson(json);
}

/// @nodoc
mixin _$TodoItem {
  String get id => throw _privateConstructorUsedError;
  String get text => throw _privateConstructorUsedError;
  bool get completed => throw _privateConstructorUsedError;
  TodoCategory get category => throw _privateConstructorUsedError;
  String? get recipeId => throw _privateConstructorUsedError;

  /// Serializes this TodoItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TodoItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TodoItemCopyWith<TodoItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TodoItemCopyWith<$Res> {
  factory $TodoItemCopyWith(TodoItem value, $Res Function(TodoItem) then) =
      _$TodoItemCopyWithImpl<$Res, TodoItem>;
  @useResult
  $Res call({
    String id,
    String text,
    bool completed,
    TodoCategory category,
    String? recipeId,
  });
}

/// @nodoc
class _$TodoItemCopyWithImpl<$Res, $Val extends TodoItem>
    implements $TodoItemCopyWith<$Res> {
  _$TodoItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TodoItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? text = null,
    Object? completed = null,
    Object? category = null,
    Object? recipeId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            text: null == text
                ? _value.text
                : text // ignore: cast_nullable_to_non_nullable
                      as String,
            completed: null == completed
                ? _value.completed
                : completed // ignore: cast_nullable_to_non_nullable
                      as bool,
            category: null == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as TodoCategory,
            recipeId: freezed == recipeId
                ? _value.recipeId
                : recipeId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TodoItemImplCopyWith<$Res>
    implements $TodoItemCopyWith<$Res> {
  factory _$$TodoItemImplCopyWith(
    _$TodoItemImpl value,
    $Res Function(_$TodoItemImpl) then,
  ) = __$$TodoItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String text,
    bool completed,
    TodoCategory category,
    String? recipeId,
  });
}

/// @nodoc
class __$$TodoItemImplCopyWithImpl<$Res>
    extends _$TodoItemCopyWithImpl<$Res, _$TodoItemImpl>
    implements _$$TodoItemImplCopyWith<$Res> {
  __$$TodoItemImplCopyWithImpl(
    _$TodoItemImpl _value,
    $Res Function(_$TodoItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of TodoItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? text = null,
    Object? completed = null,
    Object? category = null,
    Object? recipeId = freezed,
  }) {
    return _then(
      _$TodoItemImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        text: null == text
            ? _value.text
            : text // ignore: cast_nullable_to_non_nullable
                  as String,
        completed: null == completed
            ? _value.completed
            : completed // ignore: cast_nullable_to_non_nullable
                  as bool,
        category: null == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as TodoCategory,
        recipeId: freezed == recipeId
            ? _value.recipeId
            : recipeId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TodoItemImpl implements _TodoItem {
  const _$TodoItemImpl({
    required this.id,
    required this.text,
    this.completed = false,
    this.category = TodoCategory.other,
    this.recipeId,
  });

  factory _$TodoItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$TodoItemImplFromJson(json);

  @override
  final String id;
  @override
  final String text;
  @override
  @JsonKey()
  final bool completed;
  @override
  @JsonKey()
  final TodoCategory category;
  @override
  final String? recipeId;

  @override
  String toString() {
    return 'TodoItem(id: $id, text: $text, completed: $completed, category: $category, recipeId: $recipeId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TodoItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.text, text) || other.text == text) &&
            (identical(other.completed, completed) ||
                other.completed == completed) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.recipeId, recipeId) ||
                other.recipeId == recipeId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, text, completed, category, recipeId);

  /// Create a copy of TodoItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TodoItemImplCopyWith<_$TodoItemImpl> get copyWith =>
      __$$TodoItemImplCopyWithImpl<_$TodoItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TodoItemImplToJson(this);
  }
}

abstract class _TodoItem implements TodoItem {
  const factory _TodoItem({
    required final String id,
    required final String text,
    final bool completed,
    final TodoCategory category,
    final String? recipeId,
  }) = _$TodoItemImpl;

  factory _TodoItem.fromJson(Map<String, dynamic> json) =
      _$TodoItemImpl.fromJson;

  @override
  String get id;
  @override
  String get text;
  @override
  bool get completed;
  @override
  TodoCategory get category;
  @override
  String? get recipeId;

  /// Create a copy of TodoItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TodoItemImplCopyWith<_$TodoItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
