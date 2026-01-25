import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
  }, []);

  // Premium gate - show upgrade prompt for non-premium users
  if (!isCheckingPremium && !isPremium) {
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
            <TouchableOpacity onPress={() => router.back()}>
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
              'Drag & drop scheduling',
              'Auto shopping lists',
              'Nutritional insights',
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
          <TouchableOpacity onPress={() => router.back()}>
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
        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {/* Header Row */}
          <View style={styles.gridRow}>
            <View style={styles.mealTypeColumn} />
            {DAYS.map((day) => (
              <View key={day} style={styles.dayHeader}>
                <Text style={[styles.dayText, { color: colors.foreground }]}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Meal Rows */}
          {MEAL_TYPES.map((meal, mealIndex) => (
            <Animated.View
              key={meal}
              entering={FadeInDown.delay(mealIndex * 100).duration(300)}
              style={styles.gridRow}
            >
              <View style={styles.mealTypeColumn}>
                <Text style={[styles.mealTypeText, { color: colors.foreground }]}>{meal}</Text>
              </View>
              {DAYS.map((day) => {
                const recipeName = mealPlan[day]?.[meal];
                const isSelected = selectedSlot?.day === day && selectedSlot?.meal === meal;

                return (
                  <TouchableOpacity
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
                    onLongPress={() => recipeName && handleClearSlot(day, meal)}
                  >
                    {recipeName ? (
                      <Text
                        style={[styles.slotRecipe, { color: colors.primary }]}
                        numberOfLines={2}
                      >
                        {recipeName}
                      </Text>
                    ) : (
                      <Feather name="plus" size={16} color={colors.muted} />
                    )}
                  </TouchableOpacity>
                );
              })}
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
                    <TouchableOpacity
                      key={recipe.id}
                      style={[
                        styles.recipeCard,
                        { backgroundColor: colors.glassBackgroundStrong },
                      ]}
                      onPress={() => handleAssignRecipe(recipe.id, recipe.name)}
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
                    </TouchableOpacity>
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
              >
                <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
              </TouchableOpacity>
            </GlassView>
          </Animated.View>
        )}

        {/* Instructions */}
        <GlassView intensity="light" style={styles.instructions}>
          <View style={styles.instructionItem}>
            <View style={[styles.instructionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Feather name="plus" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.instructionText, { color: colors.muted }]}>
              Tap a slot to add a recipe
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={[styles.instructionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Feather name="trash-2" size={16} color={colors.secondary} />
            </View>
            <Text style={[styles.instructionText, { color: colors.muted }]}>
              Long press to remove a recipe
            </Text>
          </View>
        </GlassView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  calendarGrid: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  mealTypeColumn: {
    width: 70,
    justifyContent: 'center',
    paddingRight: 8,
  },
  mealTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mealSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  slotRecipe: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
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
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  instructions: {
    padding: 16,
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 14,
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
