import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/todos_provider.dart';
import '../../../shared/models/models.dart';
import '../../../core/theme/app_colors.dart';

class TodoListScreen extends ConsumerStatefulWidget {
  const TodoListScreen({super.key});

  @override
  ConsumerState<TodoListScreen> createState() => _TodoListScreenState();
}

class _TodoListScreenState extends ConsumerState<TodoListScreen> {
  final _textController = TextEditingController();
  TodoCategory _selectedCategory = TodoCategory.shopping;

  static const _quickSuggestions = [
    'Buy groceries',
    'Prep vegetables',
    'Marinate meat',
    'Preheat oven',
    'Thaw ingredients',
  ];

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _addTodo() async {
    if (_textController.text.trim().isEmpty) return;
    await ref
        .read(todosProvider.notifier)
        .addTodo(_textController.text, _selectedCategory, null);
    _textController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(todosProvider);
    final notifier = ref.read(todosProvider.notifier);
    final total = state.items.length;
    final done = state.completedCount;
    final pct = total == 0 ? 0.0 : done / total;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping List'),
        centerTitle: false,
        elevation: 0,
        actions: [
          if (done > 0)
            TextButton.icon(
              onPressed: () async {
                await notifier.clearCompleted();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Completed items cleared'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                }
              },
              icon: const Icon(Icons.check_circle_outline, size: 16),
              label: const Text('Clear done'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Progress area
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      total == 0 ? 'No tasks yet' : '$done/$total done',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: total == 0
                            ? AppColors.textSecondary
                            : AppColors.primary,
                      ),
                    ),
                    if (total > 0)
                      Text(
                        '${(pct * 100).round()}%',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: pct,
                    minHeight: 6,
                    backgroundColor: AppColors.primary.withOpacity(0.12),
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Category filter row
          _CategoryFilterRow(
            selected: state.categoryFilter,
            onSelected: notifier.setCategoryFilter,
          ),
          const SizedBox(height: 4),
          // Quick suggestions
          if (state.items.isEmpty)
            _QuickSuggestionsRow(
              suggestions: _quickSuggestions,
              onTap: (s) async {
                await ref
                    .read(todosProvider.notifier)
                    .addTodo(s, _selectedCategory, null);
              },
            ),
          // List
          Expanded(
            child: state.filteredItems.isEmpty
                ? _EmptyState(hasFilter: state.categoryFilter != null)
                : _TodoList(
                    items: state.filteredItems,
                    notifier: notifier,
                    groupByCategory: state.categoryFilter == null,
                  ),
          ),
          // Add new item bar
          _AddItemBar(
            controller: _textController,
            selectedCategory: _selectedCategory,
            onCategoryChanged: (c) => setState(() => _selectedCategory = c),
            onAdd: _addTodo,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Category filter row
// ---------------------------------------------------------------------------

class _CategoryFilterRow extends StatelessWidget {
  const _CategoryFilterRow({
    required this.selected,
    required this.onSelected,
  });

  final TodoCategory? selected;
  final ValueChanged<TodoCategory?> onSelected;

  static const _chips = [
    (label: 'All', icon: '📋', category: null),
    (label: 'Shopping', icon: '🛒', category: TodoCategory.shopping),
    (label: 'Prep', icon: '🔪', category: TodoCategory.prep),
    (label: 'Cooking', icon: '🍳', category: TodoCategory.cooking),
    (label: 'Other', icon: '📝', category: TodoCategory.other),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        children: _chips.map((chip) {
          final isSelected = chip.category == selected;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(
                '${chip.icon} ${chip.label}',
                style: const TextStyle(fontSize: 12),
              ),
              selected: isSelected,
              onSelected: (_) => onSelected(chip.category),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 4),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Quick suggestions
// ---------------------------------------------------------------------------

class _QuickSuggestionsRow extends StatelessWidget {
  const _QuickSuggestionsRow({
    required this.suggestions,
    required this.onTap,
  });

  final List<String> suggestions;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick add:',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: suggestions.map((s) {
              return ActionChip(
                label: Text(s, style: const TextStyle(fontSize: 12)),
                onPressed: () => onTap(s),
                visualDensity: VisualDensity.compact,
                padding: const EdgeInsets.symmetric(horizontal: 4),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Todo list
// ---------------------------------------------------------------------------

class _TodoList extends StatelessWidget {
  const _TodoList({
    required this.items,
    required this.notifier,
    required this.groupByCategory,
  });

  final List<TodoItem> items;
  final TodosNotifier notifier;
  final bool groupByCategory;

  static const _categoryLabels = {
    TodoCategory.shopping: '🛒 Shopping',
    TodoCategory.prep: '🔪 Prep',
    TodoCategory.cooking: '🍳 Cooking',
    TodoCategory.other: '📝 Other',
  };

  @override
  Widget build(BuildContext context) {
    if (!groupByCategory) {
      return ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: items.length,
        itemBuilder: (_, i) => _TodoTile(item: items[i], notifier: notifier),
      );
    }

    final grouped = <TodoCategory, List<TodoItem>>{};
    for (final item in items) {
      grouped.putIfAbsent(item.category, () => []).add(item);
    }

    final widgets = <Widget>[];
    for (final entry in grouped.entries) {
      widgets.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Text(
            _categoryLabels[entry.key] ?? entry.key.name,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
      );
      for (final item in entry.value) {
        widgets.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _TodoTile(item: item, notifier: notifier),
          ),
        );
      }
    }

    return ListView(
      padding: const EdgeInsets.only(bottom: 16),
      children: widgets,
    );
  }
}

class _TodoTile extends StatelessWidget {
  const _TodoTile({required this.item, required this.notifier});

  final TodoItem item;
  final TodosNotifier notifier;

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(item.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: AppColors.error.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete_outline, color: AppColors.error),
      ),
      onDismissed: (_) => notifier.deleteTodo(item.id),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
        leading: Checkbox(
          value: item.completed,
          onChanged: (_) => notifier.toggleTodo(item.id),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          activeColor: AppColors.primary,
        ),
        title: Text(
          item.text,
          style: TextStyle(
            fontSize: 14,
            decoration: item.completed ? TextDecoration.lineThrough : null,
            color: item.completed ? AppColors.textSecondary : null,
          ),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, size: 18),
          color: AppColors.textSecondary,
          onPressed: () => notifier.deleteTodo(item.id),
          splashRadius: 20,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.hasFilter});

  final bool hasFilter;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            hasFilter ? Icons.filter_list_off : Icons.checklist_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 12),
          Text(
            hasFilter ? 'No items in this category' : 'Your list is empty',
            style: Theme.of(context).textTheme.titleSmall,
          ),
          if (!hasFilter) ...[
            const SizedBox(height: 6),
            Text(
              'Add items below or use quick-add suggestions.',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Add item bar
// ---------------------------------------------------------------------------

class _AddItemBar extends StatelessWidget {
  const _AddItemBar({
    required this.controller,
    required this.selectedCategory,
    required this.onCategoryChanged,
    required this.onAdd,
  });

  final TextEditingController controller;
  final TodoCategory selectedCategory;
  final ValueChanged<TodoCategory> onCategoryChanged;
  final VoidCallback onAdd;

  static const _categoryIcons = {
    TodoCategory.shopping: '🛒',
    TodoCategory.prep: '🔪',
    TodoCategory.cooking: '🍳',
    TodoCategory.other: '📝',
  };

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 8, 16, 16 + bottom),
      child: Row(
        children: [
          // Category dropdown
          PopupMenuButton<TodoCategory>(
            initialValue: selectedCategory,
            onSelected: onCategoryChanged,
            tooltip: 'Category',
            itemBuilder: (_) => TodoCategory.values.map((c) {
              return PopupMenuItem(
                value: c,
                child: Text('${_categoryIcons[c]} ${c.name}'),
              );
            }).toList(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _categoryIcons[selectedCategory] ?? '📝',
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Text field
          Expanded(
            child: TextField(
              controller: controller,
              onSubmitted: (_) => onAdd(),
              textInputAction: TextInputAction.done,
              decoration: InputDecoration(
                hintText: 'Add a task...',
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Add button
          FilledButton(
            onPressed: onAdd,
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Icon(Icons.add, size: 20),
          ),
        ],
      ),
    );
  }
}
