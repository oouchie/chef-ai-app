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
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { Colors, Gradients, Shadows, EditorialColors } from '@/theme';
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

  // Animated chevron rotation
  const chevronRotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handleToggleExpand = useCallback(() => {
    hapticLight();
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: 'easeInEaseOut' },
    });

    chevronRotation.value = withSpring(isExpanded ? 0 : 180, {
      damping: 15,
      stiffness: 120,
    });

    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggleExpand, isExpanded]);

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
      entering={FadeIn.duration(350)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.card : colors.cardElevated,
          borderColor: colors.borderLight,
        },
        Shadows.cardElevated,
      ]}
    >
      {/* Collapsed Header - Editorial Typography */}
      <Pressable
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={handleToggleExpand}
      >
        <View style={styles.headerContent}>
          {/* Large Editorial Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.recipeName, { color: colors.foreground }]} numberOfLines={2}>
              {recipe.name}
            </Text>

            {/* Animated Chevron */}
            <Animated.View style={[styles.chevronContainer, chevronStyle]}>
              <Feather
                name="chevron-down"
                size={22}
                color={colors.muted}
              />
            </Animated.View>
          </View>

          {/* Metadata Row - Time, Difficulty, Servings */}
          <View style={styles.metadataRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {recipe.prepTime} prep
              </Text>
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaItem}>
              <Feather name="thermometer" size={14} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {recipe.cookTime} cook
              </Text>
            </View>
            <View style={styles.metaSeparator} />
            <View style={styles.metaItem}>
              <Feather name="users" size={14} color={colors.secondary} />
              <Text style={[styles.metaText, { color: colors.muted }]}>
                {recipe.servings}
              </Text>
            </View>
          </View>

          {/* Region & Difficulty Badges */}
          <View style={styles.badgesRow}>
            {regionInfo && (
              <View style={[styles.regionBadge, { backgroundColor: colors.secondary + '12' }]}>
                <Text style={styles.regionFlag}>{regionInfo.flag}</Text>
                <Text style={[styles.regionLabel, { color: colors.secondary }]}>
                  {recipe.cuisine}
                </Text>
              </View>
            )}
            <DifficultyBadge difficulty={recipe.difficulty} />
          </View>

          {/* Short Description */}
          {!isExpanded && (
            <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
              {recipe.description}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Expanded Content - Editorial Tabs */}
      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.expandedContent}>
          {/* Full Description */}
          <View style={styles.descriptionExpanded}>
            <Text style={[styles.descriptionText, { color: colors.foreground }]}>
              {recipe.description}
            </Text>
          </View>

          {/* Underline Tab Bar */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            {(['ingredients', 'instructions', 'tips'] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  style={styles.tab}
                  onPress={() => handleTabChange(tab)}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isActive ? colors.primary : colors.muted,
                        fontWeight: isActive ? '600' : '500',
                      },
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                  {isActive && (
                    <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Tab Content */}
          <ScrollView
            style={styles.tabContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {/* Ingredients Tab - Clean list with warm bullets */}
            {activeTab === 'ingredients' && (
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ing, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <View style={[styles.checkbox, { borderColor: colors.primary + '60' }]}>
                      <View style={[styles.checkboxInner, { backgroundColor: colors.primary + '20' }]} />
                    </View>
                    <View style={styles.ingredientContent}>
                      <Text style={[styles.ingredientAmount, { color: colors.primary }]}>
                        {ing.amount} {ing.unit}
                      </Text>
                      <Text style={[styles.ingredientName, { color: colors.foreground }]}>
                        {ing.name}
                      </Text>
                      {ing.notes && (
                        <Text style={[styles.ingredientNotes, { color: colors.muted }]}>
                          ({ing.notes})
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Instructions Tab - Large circled numbers */}
            {activeTab === 'instructions' && (
              <View style={styles.instructionsList}>
                {recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionRow}>
                    <View style={[styles.stepCircle, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: colors.foreground }]}>
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips Tab - Elegant blockquote style */}
            {activeTab === 'tips' && (
              <View style={styles.tipsList}>
                {recipe.tips && recipe.tips.length > 0 ? (
                  recipe.tips.map((tip, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tipBlockquote,
                        { borderLeftColor: colors.accent }
                      ]}
                    >
                      <View style={[styles.tipIconBg, { backgroundColor: colors.accent + '15' }]}>
                        <Feather name="info" size={14} color={colors.accent} />
                      </View>
                      <Text style={[styles.tipText, { color: colors.foreground }]}>
                        {tip}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyTips}>
                    <Feather name="info" size={20} color={colors.muted} />
                    <Text style={[styles.emptyTipsText, { color: colors.muted }]}>
                      No tips available for this recipe.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Action Buttons - Heart (Save) & Plus (Add to List) */}
      <View style={[styles.actions, { borderTopColor: colors.borderLight }]}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: isSaved
                ? colors.primary + '15'
                : 'transparent',
              borderColor: isSaved ? colors.primary + '30' : colors.borderLight,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          onPress={handleSave}
        >
          <Feather
            name={isSaved ? 'heart' : 'heart'}
            size={18}
            color={isSaved ? colors.primary : colors.muted}
            style={isSaved ? { opacity: 1 } : { opacity: 0.7 }}
          />
          <Text
            style={[
              styles.actionLabel,
              { color: isSaved ? colors.primary : colors.muted },
            ]}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.secondary + '12',
              borderColor: colors.secondary + '25',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          onPress={handleAddToShoppingList}
        >
          <Feather name="plus" size={18} color={colors.secondary} />
          <Text style={[styles.actionLabel, { color: colors.secondary }]}>
            Add to List
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
    padding: 18,
    paddingBottom: 14,
  },
  headerContent: {
    gap: 12,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d4d4d4',
    marginHorizontal: 10,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 5,
  },
  regionFlag: {
    fontSize: 13,
  },
  regionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  expandedContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  descriptionExpanded: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
  },
  tabContent: {
    maxHeight: 320,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  ingredientsList: {
    gap: 14,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  ingredientContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 4,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '500',
  },
  ingredientNotes: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  instructionsList: {
    gap: 18,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    paddingTop: 5,
  },
  tipsList: {
    gap: 14,
  },
  tipBlockquote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingLeft: 14,
    borderLeftWidth: 3,
    paddingVertical: 8,
  },
  tipIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  emptyTips: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyTipsText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 14,
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
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
