import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../shared/models/models.dart';
import '../../../core/services/storage_service.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

class TodosState {
  final List<TodoItem> items;
  final TodoCategory? categoryFilter;

  const TodosState({
    this.items = const [],
    this.categoryFilter,
  });

  TodosState copyWith({
    List<TodoItem>? items,
    TodoCategory? categoryFilter,
    bool clearCategoryFilter = false,
  }) {
    return TodosState(
      items: items ?? this.items,
      categoryFilter: clearCategoryFilter
          ? null
          : (categoryFilter ?? this.categoryFilter),
    );
  }

  List<TodoItem> get filteredItems {
    if (categoryFilter == null) return items;
    return items.where((t) => t.category == categoryFilter).toList();
  }

  int get pendingCount => items.where((t) => !t.completed).length;
  int get completedCount => items.where((t) => t.completed).length;
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class TodosNotifier extends StateNotifier<TodosState> {
  TodosNotifier() : super(const TodosState()) {
    _load();
  }

  static const _uuid = Uuid();

  Future<void> _load() async {
    final items = await StorageService.getTodos();
    state = state.copyWith(items: items);
  }

  Future<void> _persist() async {
    await StorageService.saveTodos(state.items);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  Future<void> addTodo(
    String text,
    TodoCategory category,
    String? recipeId,
  ) async {
    if (text.trim().isEmpty) return;

    final todo = TodoItem(
      id: _uuid.v4(),
      text: text.trim(),
      category: category,
      recipeId: recipeId,
    );

    state = state.copyWith(items: [...state.items, todo]);
    await _persist();
  }

  Future<void> toggleTodo(String id) async {
    state = state.copyWith(
      items: state.items.map((t) {
        if (t.id == id) return t.copyWith(completed: !t.completed);
        return t;
      }).toList(),
    );
    await _persist();
  }

  Future<void> deleteTodo(String id) async {
    state = state.copyWith(
      items: state.items.where((t) => t.id != id).toList(),
    );
    await _persist();
  }

  Future<void> clearCompleted() async {
    state = state.copyWith(
      items: state.items.where((t) => !t.completed).toList(),
    );
    await _persist();
  }

  Future<void> addIngredientsFromRecipe(
    Recipe recipe,
    List<Ingredient> ingredients,
  ) async {
    final newTodos = ingredients.map((ing) {
      final label = ing.unit.isNotEmpty
          ? '${ing.amount} ${ing.unit} ${ing.name}'.trim()
          : '${ing.amount} ${ing.name}'.trim();

      return TodoItem(
        id: _uuid.v4(),
        text: label,
        category: TodoCategory.shopping,
        recipeId: recipe.name,
      );
    }).toList();

    state = state.copyWith(items: [...state.items, ...newTodos]);
    await _persist();
  }

  void setCategoryFilter(TodoCategory? category) {
    if (category == null) {
      state = state.copyWith(clearCategoryFilter: true);
    } else {
      state = state.copyWith(categoryFilter: category);
    }
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final todosProvider = StateNotifierProvider<TodosNotifier, TodosState>(
  (ref) => TodosNotifier(),
);
