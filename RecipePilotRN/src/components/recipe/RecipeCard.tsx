import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';

import { Colors, Gradients, Shadows } from '@/theme';
import { Recipe, Ingredient, WORLD_REGIONS } from '@/types';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { DifficultyBadge, TimeBadge } from '@/components/ui';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = 'ingredients' | 'instructions' | 'tips';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: () => void;
  onAddToShoppingList: () => void;
  isSaved: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function RecipeCard({
  recipe,
  onSave,
  onAddToShoppingList,
  isSaved,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: RecipeCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [internalExpanded, setInternalExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');

  const isExpanded = controlledExpanded ?? internalExpanded;

  const handleToggleExpand = useCallback(() => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggleExpand]);

  const handleSave = useCallback(() => {
    hapticSuccess();
    onSave();
  }, [onSave]);

  const handleAddToShoppingList = useCallback(() => {
    hapticLight();
    onAddToShoppingList();
  }, [onAddToShoppingList]);

  const handleTabChange = useCallback((tab: TabType) => {
    hapticLight();
    setActiveTab(tab);
  }, []);

  const regionInfo = WORLD_REGIONS.find((r) => r.id === recipe.region);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.card,
        {
          backgroundColor: colors.glassBackgroundStrong,
          borderColor: colors.glassBorder,
        },
        Shadows.glassCard,
      ]}
    >
      {/* Header */}
      <Pressable
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handleToggleExpand}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
              {recipe.name}
            </Text>
            <Feather
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.muted}
            />
          </View>

          {/* Region and Cuisine */}
          <View style={styles.metaRow}>
            {regionInfo && (
              <View style={[styles.regionBadge, { backgroundColor: colors.secondary + '20' }]}>
                <Text style={styles.regionFlag}>{regionInfo.flag}</Text>
                <Text style={[styles.regionText, { color: colors.secondary }]}>
                  {recipe.cuisine}
                </Text>
              </View>
            )}
            <DifficultyBadge difficulty={recipe.difficulty} />
          </View>

          {/* Time Info */}
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Feather name="clock" size={14} color={colors.muted} />
              <Text style={[styles.timeText, { color: colors.muted }]}>
                Prep: {recipe.prepTime}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <Feather name="zap" size={14} color={colors.muted} />
              <Text style={[styles.timeText, { color: colors.muted }]}>
                Cook: {recipe.cookTime}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <Feather name="users" size={14} color={colors.muted} />
              <Text style={[styles.timeText, { color: colors.muted }]}>
                {recipe.servings} servings
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
            {recipe.description}
          </Text>
        </View>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.expandedContent}>
          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            {(['ingredients', 'instructions', 'tips'] as TabType[]).map((tab) => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  styles.tab,
                  activeTab === tab && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 2,
                  },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => handleTabChange(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? colors.primary : colors.muted },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab Content */}
          <ScrollView style={styles.tabContent} nestedScrollEnabled>
            {activeTab === 'ingredients' && (
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ing, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.ingredientText, { color: colors.foreground }]}>
                      <Text style={styles.ingredientAmount}>
                        {ing.amount} {ing.unit}
                      </Text>{' '}
                      {ing.name}
                      {ing.notes && (
                        <Text style={[styles.ingredientNotes, { color: colors.muted }]}>
                          {' '}({ing.notes})
                        </Text>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'instructions' && (
              <View style={styles.instructionsList}>
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: colors.foreground }]}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'tips' && (
              <View style={styles.tipsList}>
                {recipe.tips && recipe.tips.length > 0 ? (
                  recipe.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipIcon}>💡</Text>
                      <Text style={[styles.tipText, { color: colors.foreground }]}>
                        {tip}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noTips, { color: colors.muted }]}>
                    No tips available for this recipe.
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: isSaved ? colors.primary + '20' : colors.glassBackground,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          onPress={handleSave}
        >
          <Feather
            name={isSaved ? 'bookmark' : 'bookmark'}
            size={20}
            color={isSaved ? colors.primary : colors.foreground}
          />
          <Text
            style={[
              styles.actionText,
              { color: isSaved ? colors.primary : colors.foreground },
            ]}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.secondary + '20',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          onPress={handleAddToShoppingList}
        >
          <Feather name="shopping-cart" size={20} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.secondary }]}>
            Shopping List
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  headerContent: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  regionFlag: {
    fontSize: 14,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    maxHeight: 300,
    padding: 16,
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientAmount: {
    fontWeight: '600',
  },
  ingredientNotes: {
    fontStyle: 'italic',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  noTips: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
