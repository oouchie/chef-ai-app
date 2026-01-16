import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/theme';
import { Recipe, Ingredient } from '@/types';
import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { hapticSuccess, hapticLight } from '@/lib/haptics';
import { GlassView, GradientButton, GlassButton } from '@/components/ui';

export default function IngredientsModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ recipe: string }>();
  const { addShoppingList, addTodo } = useAppState();
  const { showToast } = useToast();

  const recipe: Recipe | null = useMemo(() => {
    try {
      return params.recipe ? JSON.parse(params.recipe) : null;
    } catch {
      return null;
    }
  }, [params.recipe]);

  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(
    new Set(recipe?.ingredients.map((_, i) => i) || [])
  );

  const toggleIngredient = useCallback((index: number) => {
    hapticLight();
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    hapticLight();
    setSelectedIngredients(new Set(recipe?.ingredients.map((_, i) => i) || []));
  }, [recipe]);

  const clearAll = useCallback(() => {
    hapticLight();
    setSelectedIngredients(new Set());
  }, []);

  const handleAddToList = useCallback(() => {
    if (!recipe) return;

    const selectedItems = recipe.ingredients.filter((_, i) => selectedIngredients.has(i));

    selectedItems.forEach((ing) => {
      const text = `${ing.amount || ''} ${ing.unit || ''} ${ing.name || 'Unknown'}${
        ing.notes ? ` (${ing.notes})` : ''
      }`.trim();
      addTodo(text, 'shopping', recipe.id);
    });

    hapticSuccess();
    showToast(`Added ${selectedItems.length} items to shopping list`, 'success');
    router.back();
  }, [recipe, selectedIngredients, addTodo, showToast]);

  const formatIngredient = (ing: Ingredient): string => {
    return `${ing.amount || ''} ${ing.unit || ''} ${ing.name || 'Unknown'}${
      ing.notes ? ` (${ing.notes})` : ''
    }`.trim();
  };

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Recipe not found</Text>
      </View>
    );
  }

  const renderIngredient = ({ item, index }: { item: Ingredient; index: number }) => {
    const isSelected = selectedIngredients.has(index);

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
        <TouchableOpacity
          style={[
            styles.ingredientItem,
            {
              backgroundColor: isSelected
                ? colors.primary + '10'
                : colors.glassBackgroundStrong,
              borderColor: isSelected ? colors.primary : colors.glassBorder,
            },
          ]}
          onPress={() => toggleIngredient(index)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isSelected ? colors.primary : 'transparent',
                borderColor: isSelected ? colors.primary : colors.muted,
              },
            ]}
          >
            {isSelected && <Feather name="check" size={14} color="white" />}
          </View>
          <Text
            style={[
              styles.ingredientText,
              { color: colors.foreground },
              !isSelected && styles.ingredientUnselected,
            ]}
          >
            {formatIngredient(item)}
          </Text>
          {!isSelected && (
            <View style={[styles.haveItBadge, { backgroundColor: colors.muted + '30' }]}>
              <Text style={[styles.haveItText, { color: colors.muted }]}>Have it</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <GlassView
        intensity="strong"
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        borderRadius={0}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Add to Shopping List
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              {recipe.name}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Selection Controls */}
        <View style={styles.selectionControls}>
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: colors.primary + '15' }]}
            onPress={selectAll}
          >
            <Text style={[styles.selectButtonText, { color: colors.primary }]}>
              Select All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: colors.muted + '15' }]}
            onPress={clearAll}
          >
            <Text style={[styles.selectButtonText, { color: colors.muted }]}>
              Clear All
            </Text>
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={[styles.countText, { color: colors.foreground }]}>
              {selectedIngredients.size} / {recipe.ingredients.length}
            </Text>
          </View>
        </View>
      </GlassView>

      {/* Ingredients List */}
      <FlatList
        data={recipe.ingredients}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderIngredient}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <GradientButton
          title={`Add ${selectedIngredients.size} Item${selectedIngredients.size !== 1 ? 's' : ''} to List`}
          onPress={handleAddToList}
          disabled={selectedIngredients.size === 0}
          fullWidth
          size="lg"
          icon={<Feather name="shopping-cart" size={20} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  countBadge: {
    marginLeft: 'auto',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
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
  ingredientText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientUnselected: {
    opacity: 0.6,
  },
  haveItBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  haveItText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});
