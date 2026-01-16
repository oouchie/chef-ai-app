import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors } from '@/theme';
import { Recipe } from '@/types';
import { hapticSuccess, hapticWarning } from '@/lib/haptics';

import { GlassView } from '@/components/ui';
import RecipeCard from '@/components/recipe/RecipeCard';

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { state, unsaveRecipe, addShoppingList } = useAppState();
  const { showToast } = useToast();

  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const handleUnsaveRecipe = useCallback((recipeId: string) => {
    unsaveRecipe(recipeId);
    hapticWarning();
    showToast('Recipe removed from saved', 'info');
  }, [unsaveRecipe, showToast]);

  const handleAddToShoppingList = useCallback((recipe: Recipe) => {
    router.push({
      pathname: '/(modals)/ingredients',
      params: { recipe: JSON.stringify(recipe) },
    });
  }, []);

  const handleToggleExpand = useCallback((recipeId: string) => {
    setExpandedRecipeId((prev) => (prev === recipeId ? null : recipeId));
  }, []);

  const renderRecipe = useCallback(
    ({ item, index }: { item: Recipe; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.recipeItem}
      >
        <RecipeCard
          recipe={item}
          onSave={() => handleUnsaveRecipe(item.id)}
          onAddToShoppingList={() => handleAddToShoppingList(item)}
          isSaved={true}
          isExpanded={expandedRecipeId === item.id}
          onToggleExpand={() => handleToggleExpand(item.id)}
        />
      </Animated.View>
    ),
    [expandedRecipeId, handleUnsaveRecipe, handleAddToShoppingList, handleToggleExpand]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '20' }]}>
          <Feather name="bookmark" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          No saved recipes yet
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Start a chat and save recipes you love!
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Feather name="message-circle" size={20} color="white" />
          <Text style={styles.emptyButtonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    ),
    [colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <GlassView
        intensity="strong"
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        borderRadius={0}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Saved Recipes
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          {state.savedRecipes.length} recipe{state.savedRecipes.length !== 1 ? 's' : ''}
        </Text>
      </GlassView>

      {/* Recipe List */}
      <FlatList
        data={state.savedRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        contentContainerStyle={[
          styles.listContent,
          state.savedRecipes.length === 0 && styles.emptyListContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  recipeItem: {
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
