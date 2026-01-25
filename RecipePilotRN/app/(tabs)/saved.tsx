import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeOut,
  FadeIn,
  Layout,
} from 'react-native-reanimated';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors, Gradients, Shadows } from '@/theme';
import { Recipe } from '@/types';
import { hapticSuccess, hapticWarning, hapticLight } from '@/lib/haptics';

import RecipeCard from '@/components/recipe/RecipeCard';

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { state, unsaveRecipe, addShoppingList } = useAppState();
  const { showToast } = useToast();

  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    hapticLight();
    // Simulate refresh - in a real app, this would sync with a server
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
  }, []);

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
    hapticLight();
    setExpandedRecipeId((prev) => (prev === recipeId ? null : recipeId));
  }, []);

  // Group recipes - recently saved vs favorites (for now, all are "recently saved")
  const recentRecipes = state.savedRecipes.slice(0, 10);
  const olderRecipes = state.savedRecipes.slice(10);

  const renderRecipe = useCallback(
    ({ item, index }: { item: Recipe; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 60).duration(350).springify()}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
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

  const renderSectionHeader = useCallback(
    (title: string, count: number) => (
      <Animated.View
        entering={FadeIn.delay(100).duration(300)}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {count}
          </Text>
        </View>
      </Animated.View>
    ),
    [colors]
  );

  const renderEmptyState = useCallback(
    () => (
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.emptyState}
      >
        {/* Warm illustration placeholder */}
        <View style={[styles.emptyIconOuter, { backgroundColor: colors.primary + '08' }]}>
          <View style={[styles.emptyIconInner, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="bookmark" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Your recipe collection
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Save recipes from your chats to build your personal cookbook
        </Text>

        <TouchableOpacity
          style={styles.emptyCTAContainer}
          onPress={() => {
            hapticLight();
            router.push('/(tabs)/chat');
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.emptyCTA, Shadows.glowPrimary]}
          >
            <Feather name="message-circle" size={18} color="white" />
            <Text style={styles.emptyCTAText}>Start Exploring</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    ),
    [colors]
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
              Saved Recipes
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              {state.savedRecipes.length === 0
                ? 'Your personal cookbook awaits'
                : `${state.savedRecipes.length} recipe${state.savedRecipes.length !== 1 ? 's' : ''} saved`}
            </Text>
          </View>

          {state.savedRecipes.length > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: colors.primary + '12' }]}>
              <Feather name="heart" size={14} color={colors.primary} />
            </View>
          )}
        </View>

        <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
      </View>

      {/* Recipe List with sections */}
      <FlatList
        data={state.savedRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        contentContainerStyle={[
          styles.listContent,
          state.savedRecipes.length === 0 && styles.emptyListContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListHeaderComponent={
          state.savedRecipes.length > 0
            ? () => renderSectionHeader('Recently Saved', state.savedRecipes.length)
            : null
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
      />
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
    letterSpacing: 0.1,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recipeItem: {
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconInner: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyCTAContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  emptyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
    borderRadius: 14,
  },
  emptyCTAText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
