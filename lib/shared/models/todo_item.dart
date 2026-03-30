import 'package:freezed_annotation/freezed_annotation.dart';

part 'todo_item.freezed.dart';
part 'todo_item.g.dart';

enum TodoCategory { shopping, prep, cooking, other }

@freezed
class TodoItem with _$TodoItem {
  const factory TodoItem({
    required String id,
    required String text,
    @Default(false) bool completed,
    @Default(TodoCategory.other) TodoCategory category,
    String? recipeId,
  }) = _TodoItem;

  factory TodoItem.fromJson(Map<String, dynamic> json) =>
      _$TodoItemFromJson(json);
}
