import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients } from '@/theme';
import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { hapticLight } from '@/lib/haptics';
import { purchaseService } from '@/lib/purchases';
import { GlassView, GradientButton } from '@/components/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const;

interface MealSlot {
  day: string;
  meal: typeof MEAL_TYPES[number];
  recipeName?: string;
}

export default function MealPlannerModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { state } = useAppState();
  const { showToast } = useToast();

  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string | undefined>>>({});
  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [pressedRecipeId, setPressedRecipeId] = useState<string | null>(null);

  // Check premium status on mount
  useEffect(() => {
    const checkPremium = async () => {
      try {
        const status = await purchaseService.getSubscriptionStatus();
        setIsPremium(status.isPremium);
      } catch (error) {
        console.warn('Failed to check premium status:', error);
      } finally {
        setIsCheckingPremium(false);
      }
    };
    checkPremium();
  }, []);

  const handleSlotPress = useCallback((day: string, meal: typeof MEAL_TYPES[number]) => {
    hapticLight();
    setSelectedSlot({ day, meal });
  }, []);

  const handleAssignRecipe = useCallback((recipeId: string, recipeName: string) => {
    if (!selectedSlot) return;

    setMealPlan((prev) => ({
      ...prev,
      [selectedSlot.day]: {
        ...prev[selectedSlot.day],
        [selectedSlot.meal]: recipeName,
      },
    }));

    setSelectedSlot(null);
    showToast(`Added ${recipeName} to ${selectedSlot.day} ${selectedSlot.meal}`, 'success');
  }, [selectedSlot, showToast]);

  const handleClearSlot = useCallback((day: string, meal: string) => {
    hapticLight();
    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: undefined,
      },
    }));
    showToast('Recipe removed', 'info');
  }, [showToast]);

  // Loading state
  if (isCheckingPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <GlassView
          intensity="strong"
          style={[styles.header, { paddingTop: insets.top + 10 }]}
          borderRadius={0}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Meal Planner
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close meal planner"
              accessibilityRole="button"
            >
              <Feather name="x" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </GlassView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Premium gate - show upgrade prompt for non-premium users
  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <GlassView
          intensity="strong"
          style={[styles.header, { paddingTop: insets.top + 10 }]}
          borderRadius={0}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Meal Planner
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close meal planner"
              accessibilityRole="button"
            >
              <Feather name="x" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </GlassView>

        {/* Premium Gate Content */}
        <View style={styles.premiumGateContainer}>
          <LinearGradient
            colors={Gradients.premium}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumGateIcon}
          >
            <Feather name="lock" size={32} color="white" />
          </LinearGradient>

          <Text style={[styles.premiumGateTitle, { color: colors.foreground }]}>
            Premium Feature
          </Text>
          <Text style={[styles.premiumGateSubtitle, { color: colors.muted }]}>
            Meal planning is available exclusively for premium members. Upgrade to plan
            your weekly meals and generate shopping lists automatically.
          </Text>

          <View style={styles.premiumFeatures}>
            {[
              'Weekly meal calendar',
              'Easy recipe scheduling',
              'Auto shopping lists',
              'Plan ahead for the week',
            ].map((feature, index) => (
              <View key={index} style={styles.premiumFeatureRow}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={[styles.premiumFeatureText, { color: colors.foreground }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <GradientButton
            title="Upgrade to Premium"
            onPress={() => router.push('/(modals)/paywall')}
            variant="premium"
            size="lg"
            fullWidth
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={[styles.cancelText, { color: colors.muted }]}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <GlassView
        intensity="strong"
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        borderRadius={0}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Meal Planner
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close meal planner"
            accessibilityRole="button"
          >
            <Feather name="x" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          Plan your meals for the week
        </Text>
      </GlassView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dismissable Hints */}
        {showHints && (
          <Animated.View entering={FadeIn.duration(300)}>
            <GlassView intensity="light" style={styles.hintsCard}>
              <View style={styles.hintsContent}>
                <Feather name="info" size={18} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.foreground }]}>
                  Tap a slot to add a recipe. Tap the X to remove.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHints(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Dismiss hint"
                accessibilityRole="button"
              >
                <Text style={[styles.dismissHint, { color: colors.primary }]}>Got it</Text>
              </TouchableOpacity>
            </GlassView>
          </Animated.View>
        )}

        {/* Calendar Grid - Horizontal scrolling per meal type */}
        <View style={styles.calendarGrid}>
          {MEAL_TYPES.map((meal, mealIndex) => (
            <Animated.View
              key={meal}
              entering={FadeInDown.delay(mealIndex * 100).duration(300)}
              style={styles.mealRow}
            >
              <View style={styles.mealTypeHeader}>
                <View style={[styles.mealTypeIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Feather
                    name={meal === 'Breakfast' ? 'sunrise' : meal === 'Lunch' ? 'sun' : 'moon'}
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.mealTypeText, { color: colors.foreground }]}>{meal}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.daysScrollContent}
              >
                {DAYS.map((day) => {
                  const recipeName = mealPlan[day]?.[meal];
                  const isSelected = selectedSlot?.day === day && selectedSlot?.meal === meal;

                  return (
                    <Pressable
                      key={`${day}-${meal}`}
                      style={[
                        styles.mealSlot,
                        {
                          backgroundColor: recipeName
                            ? colors.primary + '15'
                            : colors.glassBackgroundStrong,
                          borderColor: isSelected ? colors.primary : colors.glassBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => handleSlotPress(day, meal)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        recipeName
                          ? `${day} ${meal}: ${recipeName}. Tap to change.`
                          : `Add recipe for ${day} ${meal}`
                      }
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[styles.dayLabel, { color: colors.muted }]}>{day}</Text>

                      {recipeName ? (
                        <View style={styles.slotContent}>
                          <View style={[styles.recipeIndicator, { backgroundColor: colors.primary }]}>
                            <Feather name="check" size={12} color="white" />
                          </View>
                          <Text
                            style={[styles.slotRecipe, { color: colors.primary }]}
                            numberOfLines={2}
                          >
                            {recipeName}
                          </Text>
                          {/* Visible delete button - uses Pressable to prevent parent trigger */}
                          <Pressable
                            onPress={() => handleClearSlot(day, meal)}
                            style={({ pressed }) => [
                              styles.deleteButton,
                              pressed && { opacity: 0.7 }
                            ]}
                            hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
                            accessibilityLabel={`Remove ${recipeName} from ${day} ${meal}`}
                            accessibilityRole="button"
                          >
                            <View style={[styles.deleteIcon, { backgroundColor: colors.error }]}>
                              <Feather name="x" size={10} color="white" />
                            </View>
                          </Pressable>
                        </View>
                      ) : (
                        <View style={styles.emptySlot}>
                          <Feather name="plus" size={18} color={colors.muted} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>
          ))}
        </View>

        {/* Recipe Selection */}
        {selectedSlot && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <GlassView intensity="strong" style={styles.recipeSelection}>
              <Text style={[styles.selectionTitle, { color: colors.foreground }]}>
                Select a recipe for {selectedSlot.day} {selectedSlot.meal}
              </Text>

              {state.savedRecipes.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {state.savedRecipes.map((recipe) => (
                    <Pressable
                      key={recipe.id}
                      style={[
                        styles.recipeCard,
                        {
                          backgroundColor: colors.glassBackgroundStrong,
                          transform: [{ scale: pressedRecipeId === recipe.id ? 0.97 : 1 }],
                          borderColor: pressedRecipeId === recipe.id ? colors.primary : 'transparent',
                          borderWidth: 2,
                        },
                      ]}
                      onPressIn={() => setPressedRecipeId(recipe.id)}
                      onPressOut={() => setPressedRecipeId(null)}
                      onPress={() => handleAssignRecipe(recipe.id, recipe.name)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${recipe.name} to ${selectedSlot.day} ${selectedSlot.meal}`}
                    >
                      <Text
                        style={[styles.recipeCardName, { color: colors.foreground }]}
                        numberOfLines={2}
                      >
                        {recipe.name}
                      </Text>
                      <Text style={[styles.recipeCardCuisine, { color: colors.muted }]}>
                        {recipe.cuisine}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyRecipes}>
                  <Feather name="bookmark" size={32} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.muted }]}>
                    No saved recipes yet
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                    Save some recipes to add them to your meal plan
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedSlot(null)}
                accessibilityLabel="Cancel selection"
                accessibilityRole="button"
              >
                <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
            </GlassView>
          </Animated.View>
        )}
      </ScrollView>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  // Hints card
  hintsCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hintText: {
    fontSize: 14,
    flex: 1,
  },
  dismissHint: {
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 12,
  },
  // Calendar grid - horizontal scroll per meal
  calendarGrid: {
    gap: 20,
  },
  mealRow: {
    gap: 10,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  mealTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  daysScrollContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  mealSlot: {
    width: 80,
    height: 90,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  recipeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  slotRecipe: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  deleteIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Recipe selection
  recipeSelection: {
    padding: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  recipeCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    minHeight: 70,
  },
  recipeCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeCardCuisine: {
    fontSize: 12,
  },
  emptyRecipes: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Premium gate styles
  premiumGateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  premiumGateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  premiumGateTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumGateSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
  },
  premiumFeatures: {
    alignSelf: 'stretch',
    marginBottom: 32,
    gap: 12,
  },
  premiumFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumFeatureText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
