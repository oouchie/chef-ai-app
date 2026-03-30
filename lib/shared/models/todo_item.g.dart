// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'todo_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TodoItemImpl _$$TodoItemImplFromJson(Map<String, dynamic> json) =>
    _$TodoItemImpl(
      id: json['id'] as String,
      text: json['text'] as String,
      completed: json['completed'] as bool? ?? false,
      category:
          $enumDecodeNullable(_$TodoCategoryEnumMap, json['category']) ??
          TodoCategory.other,
      recipeId: json['recipeId'] as String?,
    );

Map<String, dynamic> _$$TodoItemImplToJson(_$TodoItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'text': instance.text,
      'completed': instance.completed,
      'category': _$TodoCategoryEnumMap[instance.category]!,
      'recipeId': instance.recipeId,
    };

const _$TodoCategoryEnumMap = {
  TodoCategory.shopping: 'shopping',
  TodoCategory.prep: 'prep',
  TodoCategory.cooking: 'cooking',
  TodoCategory.other: 'other',
};
