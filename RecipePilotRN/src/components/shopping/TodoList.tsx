import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOutRight,
  Layout,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors, Shadows } from '@/theme';
import { TodoItem } from '@/types';
import { hapticLight, hapticSuccess, hapticWarning } from '@/lib/haptics';
import { GlassView, GlassInput, GradientButton } from '@/components/ui';

interface TodoListProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string, category?: TodoItem['category']) => void;
  onClearCompleted: () => void;
  showAddForm?: boolean;
  category?: TodoItem['category'];
}

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onAdd,
  onClearCompleted,
  showAddForm = true,
  category = 'shopping',
}: TodoListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [newItemText, setNewItemText] = useState('');

  const filteredTodos = category
    ? todos.filter((t) => t.category === category)
    : todos;

  const completedCount = filteredTodos.filter((t) => t.completed).length;
  const totalCount = filteredTodos.length;

  const handleToggle = useCallback(
    (id: string) => {
      hapticLight();
      onToggle(id);
    },
    [onToggle]
  );

  const handleDelete = useCallback(
    (id: string) => {
      hapticWarning();
      onDelete(id);
    },
    [onDelete]
  );

  const handleAdd = useCallback(() => {
    if (!newItemText.trim()) return;

    hapticSuccess();
    onAdd(newItemText.trim(), category);
    setNewItemText('');
  }, [newItemText, category, onAdd]);

  const handleClearCompleted = useCallback(() => {
    if (completedCount === 0) return;
    hapticWarning();
    onClearCompleted();
  }, [completedCount, onClearCompleted]);

  const renderItem = useCallback(
    ({ item, index }: { item: TodoItem; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 30).duration(200)}
        exiting={FadeOutRight.duration(200)}
        layout={Layout.springify()}
      >
        <View
          style={[
            styles.todoItem,
            {
              backgroundColor: item.completed
                ? colors.success + '10'
                : colors.glassBackgroundStrong,
              borderColor: item.completed ? colors.success : colors.glassBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.checkbox,
              {
                backgroundColor: item.completed ? colors.success : 'transparent',
                borderColor: item.completed ? colors.success : colors.muted,
              },
            ]}
            onPress={() => handleToggle(item.id)}
          >
            {item.completed && (
              <Feather name="check" size={14} color="white" />
            )}
          </TouchableOpacity>

          <Text
            style={[
              styles.todoText,
              { color: colors.foreground },
              item.completed && styles.todoTextCompleted,
            ]}
            numberOfLines={2}
          >
            {item.text}
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    ),
    [colors, handleToggle, handleDelete]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {completedCount} of {totalCount} completed
          </Text>
          {completedCount > 0 && (
            <TouchableOpacity onPress={handleClearCompleted}>
              <Text style={[styles.clearText, { color: colors.primary }]}>
                Clear completed
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.success,
                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
              },
            ]}
          />
        </View>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <GlassInput
              placeholder="Add an item..."
              value={newItemText}
              onChangeText={setNewItemText}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: newItemText.trim()
                    ? colors.primary
                    : colors.muted + '30',
                },
              ]}
              onPress={handleAdd}
              disabled={!newItemText.trim()}
            >
              <Feather
                name="plus"
                size={22}
                color={newItemText.trim() ? 'white' : colors.muted}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [
      completedCount,
      totalCount,
      showAddForm,
      newItemText,
      colors,
      handleAdd,
      handleClearCompleted,
    ]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.secondary + '20' }]}>
          <Feather name="shopping-cart" size={32} color={colors.secondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Your list is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Add items manually or from a recipe
        </Text>
      </View>
    ),
    [colors]
  );

  return (
    <FlatList
      data={filteredTodos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="interactive"
    />
  );
}

// Compact version for embedding
export function CompactTodoList({
  todos,
  onToggle,
  maxItems = 5,
}: {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  maxItems?: number;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const shoppingTodos = todos
    .filter((t) => t.category === 'shopping' && !t.completed)
    .slice(0, maxItems);

  if (shoppingTodos.length === 0) {
    return null;
  }

  return (
    <View style={styles.compactContainer}>
      {shoppingTodos.map((todo) => (
        <TouchableOpacity
          key={todo.id}
          style={[styles.compactItem, { backgroundColor: colors.glassBackgroundStrong }]}
          onPress={() => {
            hapticLight();
            onToggle(todo.id);
          }}
        >
          <View style={[styles.compactCheckbox, { borderColor: colors.muted }]} />
          <Text
            style={[styles.compactText, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {todo.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  compactContainer: {
    gap: 8,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
  },
  compactCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
  },
  compactText: {
    flex: 1,
    fontSize: 14,
  },
});
