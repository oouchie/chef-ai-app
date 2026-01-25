import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeOut,
  FadeIn,
  Layout,
  SlideInRight,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors, Gradients, Shadows } from '@/theme';
import { hapticLight, hapticSuccess, hapticWarning } from '@/lib/haptics';
import { Todo } from '@/types';

// Category configuration with warm colors
const CATEGORIES = {
  shopping: { label: 'Shopping', icon: 'shopping-bag', color: '#c45d3a' },
  prep: { label: 'Prep', icon: 'scissors', color: '#7d9a78' },
  cooking: { label: 'Cooking', icon: 'thermometer', color: '#d4a574' },
  other: { label: 'Other', icon: 'more-horizontal', color: '#8b7e74' },
} as const;

interface TodoItemProps {
  item: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  colors: any;
  index: number;
}

function TodoItem({ item, onToggle, onDelete, colors, index }: TodoItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(1);
  const categoryConfig = CATEGORIES[item.category || 'shopping'];

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(-100, event.translationX);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -60) {
        translateX.value = withSpring(-100, { damping: 20 });
      } else {
        translateX.value = withSpring(0, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleToggle = () => {
    hapticLight();
    onToggle(item.id);
  };

  const handleDelete = () => {
    hapticWarning();
    onDelete(item.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(300).springify()}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={styles.todoItemContainer}
    >
      {/* Delete action behind */}
      <View style={[styles.deleteAction, { backgroundColor: colors.error }]}>
        <Feather name="trash-2" size={18} color="white" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </View>

      {/* Main item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.todoItem,
            { backgroundColor: colors.card },
            animatedStyle,
            Shadows.sm,
          ]}
        >
          {/* Checkbox */}
          <TouchableOpacity
            onPress={handleToggle}
            style={[
              styles.checkbox,
              {
                borderColor: item.completed ? colors.primary : colors.border,
                backgroundColor: item.completed ? colors.primary : 'transparent',
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {item.completed && (
              <Feather name="check" size={14} color="white" />
            )}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.todoContent}>
            <Text
              style={[
                styles.todoText,
                {
                  color: item.completed ? colors.muted : colors.foreground,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
            {item.category && (
              <View style={styles.categoryBadge}>
                <Feather
                  name={categoryConfig.icon as any}
                  size={10}
                  color={categoryConfig.color}
                />
                <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
                  {categoryConfig.label}
                </Text>
              </View>
            )}
          </View>

          {/* Direct delete button */}
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={16} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function ShoppingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { state, toggleTodo, deleteTodo, addTodo, clearCompletedTodos } = useAppState();
  const { showToast } = useToast();

  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORIES>('shopping');
  const inputRef = useRef<TextInput>(null);

  const handleAdd = useCallback(() => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    hapticSuccess();
    addTodo(trimmedText, selectedCategory);
    setInputText('');
    showToast('Item added', 'success');
  }, [inputText, selectedCategory, addTodo, showToast]);

  const handleClearCompleted = useCallback(() => {
    const completedCount = state.todos.filter((t) => t.completed).length;
    if (completedCount === 0) return;

    hapticWarning();
    clearCompletedTodos();
    showToast(`Cleared ${completedCount} item${completedCount !== 1 ? 's' : ''}`, 'info');
  }, [state.todos, clearCompletedTodos, showToast]);

  // Group todos by category
  const groupedTodos = React.useMemo(() => {
    const groups: Record<string, Todo[]> = {};
    state.todos.forEach((todo) => {
      const cat = todo.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(todo);
    });
    return groups;
  }, [state.todos]);

  const completedCount = state.todos.filter((t) => t.completed).length;
  const totalCount = state.todos.length;

  const renderEmptyState = useCallback(
    () => (
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        style={styles.emptyState}
      >
        <View style={[styles.emptyIconOuter, { backgroundColor: colors.secondary + '10' }]}>
          <View style={[styles.emptyIconInner, { backgroundColor: colors.secondary + '18' }]}>
            <Feather name="shopping-bag" size={36} color={colors.secondary} />
          </View>
        </View>

        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Your list is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Add ingredients from recipes or type items below
        </Text>
      </Animated.View>
    ),
    [colors]
  );

  const renderSectionHeader = useCallback(
    (category: string) => {
      const config = CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.other;
      const items = groupedTodos[category] || [];
      const completed = items.filter((t) => t.completed).length;

      return (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Feather name={config.icon as any} size={16} color={config.color} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {config.label}
            </Text>
          </View>
          <Text style={[styles.sectionCount, { color: colors.muted }]}>
            {completed}/{items.length}
          </Text>
        </View>
      );
    },
    [groupedTodos, colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Editorial Header */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? 'rgba(26, 22, 20, 0.88)'
                : 'rgba(250, 248, 245, 0.9)',
            },
          ]}
        />

        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Shopping List
            </Text>
            {totalCount > 0 && (
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                {completedCount} of {totalCount} completed
              </Text>
            )}
          </View>

          {completedCount > 0 && (
            <TouchableOpacity
              onPress={handleClearCompleted}
              style={[styles.clearButton, { backgroundColor: colors.primary + '12' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="check-circle" size={14} color={colors.primary} />
              <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                Clear done
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
      </View>

      {/* Todo List */}
      <FlatList
        data={Object.keys(groupedTodos)}
        keyExtractor={(item) => item}
        renderItem={({ item: category }) => (
          <View style={styles.categorySection}>
            {renderSectionHeader(category)}
            {groupedTodos[category].map((todo, index) => (
              <TodoItem
                key={todo.id}
                item={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                colors={colors}
                index={index}
              />
            ))}
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          state.todos.length === 0 && styles.emptyListContent,
          { paddingBottom: insets.bottom + 180 },
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Add Item Input - Glass styling at bottom */}
      <View
        style={[
          styles.inputWrapper,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={90}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? 'rgba(26, 22, 20, 0.92)'
                : 'rgba(250, 248, 245, 0.95)',
            },
          ]}
        />

        {/* Category selector */}
        <View style={styles.categorySelector}>
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => {
            const config = CATEGORIES[cat];
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  hapticLight();
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? config.color + '18' : 'transparent',
                    borderColor: isActive ? config.color : colors.border,
                  },
                ]}
              >
                <Feather
                  name={config.icon as any}
                  size={12}
                  color={isActive ? config.color : colors.muted}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isActive ? config.color : colors.muted },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input row */}
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(45, 36, 32, 0.8)'
                  : 'rgba(255, 255, 255, 0.9)',
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Add an item..."
              placeholderTextColor={colors.muted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            onPress={handleAdd}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={inputText.trim() ? Gradients.primary : [colors.border, colors.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.addButton,
                inputText.trim() && Shadows.glowPrimary,
              ]}
            >
              <Feather
                name="plus"
                size={20}
                color={inputText.trim() ? 'white' : colors.muted}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    overflow: 'hidden',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 13,
  },
  todoItemContainer: {
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 14,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
  },
  deleteActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
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
  todoContent: {
    flex: 1,
    gap: 4,
  },
  todoText: {
    fontSize: 15,
    lineHeight: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    paddingVertical: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
