import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients } from '@/theme';
import { useToast } from '@/components/Toast';
import { usePremium } from '@/hooks';
import { hapticLight, hapticSuccess, hapticError } from '@/lib/haptics';
import { hasUsedRestaurantTrial, markRestaurantTrialUsed } from '@/lib/storage';
import { GlassView, GlassInput } from '@/components/ui';

interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  popularDishes: string[];
  isCustom?: boolean;
}

const POPULAR_RESTAURANTS: Restaurant[] = [
  { id: 'olive-garden', name: 'Olive Garden', emoji: '🍝', popularDishes: ['Chicken Alfredo', 'Breadsticks', 'Zuppa Toscana'] },
  { id: 'chipotle', name: 'Chipotle', emoji: '🌯', popularDishes: ['Burrito Bowl', 'Carnitas', 'Guacamole'] },
  { id: 'cheesecake-factory', name: 'Cheesecake Factory', emoji: '🍰', popularDishes: ['Avocado Egg Rolls', 'Chicken Madeira', 'Cheesecake'] },
  { id: 'chick-fil-a', name: 'Chick-fil-A', emoji: '🐔', popularDishes: ['Chicken Sandwich', 'Waffle Fries', 'Chicken Nuggets'] },
  { id: 'panda-express', name: 'Panda Express', emoji: '🥡', popularDishes: ['Orange Chicken', 'Beijing Beef', 'Fried Rice'] },
  { id: 'texas-roadhouse', name: 'Texas Roadhouse', emoji: '🥩', popularDishes: ['Ribeye Steak', 'Loaded Baked Potato', 'Rolls with Cinnamon Butter'] },
  { id: 'red-lobster', name: 'Red Lobster', emoji: '🦞', popularDishes: ['Cheddar Bay Biscuits', 'Lobster Bisque', 'Shrimp Scampi'] },
  { id: 'cracker-barrel', name: 'Cracker Barrel', emoji: '🥞', popularDishes: ['Chicken & Dumplings', 'Hashbrown Casserole', 'Biscuits & Gravy'] },
  { id: 'pf-changs', name: "P.F. Chang's", emoji: '🥢', popularDishes: ['Lettuce Wraps', 'Mongolian Beef', 'Kung Pao Chicken'] },
  { id: 'in-n-out', name: 'In-N-Out', emoji: '🍔', popularDishes: ['Double-Double', 'Animal Style Fries', 'Neapolitan Shake'] },
  { id: 'popeyes', name: 'Popeyes', emoji: '🍗', popularDishes: ['Chicken Sandwich', 'Cajun Fries', 'Red Beans & Rice'] },
  { id: 'outback', name: 'Outback Steakhouse', emoji: '🥩', popularDishes: ['Bloomin Onion', 'Alice Springs Chicken', 'Victoria Filet'] },
];

export default function RestaurantModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { isPremium } = usePremium();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);
  const [customDishQuery, setCustomDishQuery] = useState('');
  const dishInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const checkTrial = async () => {
      const used = await hasUsedRestaurantTrial();
      setTrialUsed(used);
    };
    checkTrial();
  }, []);

  const filteredRestaurants = POPULAR_RESTAURANTS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show custom search card when user types 2+ chars
  const trimmedQuery = searchQuery.trim();
  const showCustomSearch = trimmedQuery.length >= 2;

  const displayData: Restaurant[] = [
    ...filteredRestaurants,
    ...(showCustomSearch
      ? [
          {
            id: 'custom-search',
            name: trimmedQuery,
            emoji: '🔍',
            popularDishes: [],
            isCustom: true,
          },
        ]
      : []),
  ];

  const isLocked = !isPremium && trialUsed;

  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    hapticLight();
    setSelectedRestaurant(restaurant);
    setCustomDishQuery('');
  }, []);

  const handleDismissPanel = useCallback(() => {
    setSelectedRestaurant(null);
    setCustomDishQuery('');
    Keyboard.dismiss();
  }, []);

  const handleGetRecipe = useCallback(async (dishName: string) => {
    if (!selectedRestaurant) {
      return;
    }

    if (isLocked) {
      hapticError();
      router.push('/(modals)/paywall');
      return;
    }

    if (!isPremium && !trialUsed) {
      await markRestaurantTrialUsed();
      setTrialUsed(true);
    }

    hapticSuccess();
    Keyboard.dismiss();

    router.push({
      pathname: '/(tabs)/chat',
      params: {
        initialMessage: `Give me a homemade recipe for ${selectedRestaurant.name}'s ${dishName}`,
      },
    });
  }, [isPremium, trialUsed, isLocked, selectedRestaurant]);

  const handleGetPopularRecipes = useCallback(async () => {
    if (!selectedRestaurant) {
      return;
    }

    if (isLocked) {
      hapticError();
      router.push('/(modals)/paywall');
      return;
    }

    if (!isPremium && !trialUsed) {
      await markRestaurantTrialUsed();
      setTrialUsed(true);
    }

    hapticSuccess();
    Keyboard.dismiss();

    router.push({
      pathname: '/(tabs)/chat',
      params: {
        initialMessage: `What are the most popular dishes from ${selectedRestaurant.name}? Give me a homemade recipe for the #1 most popular dish.`,
      },
    });
  }, [isPremium, trialUsed, isLocked, selectedRestaurant]);

  const handleCustomDishSubmit = useCallback(() => {
    const dish = customDishQuery.trim();
    if (dish) {
      handleGetRecipe(dish);
    } else {
      handleGetPopularRecipes();
    }
  }, [customDishQuery, handleGetRecipe, handleGetPopularRecipes]);

  const handleUpgrade = useCallback(() => {
    hapticLight();
    router.push('/(modals)/paywall');
  }, []);

  const renderRestaurant = useCallback(
    ({ item, index }: { item: Restaurant; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          style={[
            styles.restaurantCard,
            {
              backgroundColor: item.isCustom
                ? colors.primary + '10'
                : selectedRestaurant?.id === item.id
                  ? colors.primary + '15'
                  : colors.glassBackgroundStrong,
              borderColor: item.isCustom
                ? colors.primary + '40'
                : selectedRestaurant?.id === item.id
                  ? colors.primary
                  : colors.glassBorder,
              borderStyle: item.isCustom ? 'dashed' : 'solid',
              transform: [{ scale: pressedCardId === item.id ? 0.98 : 1 }],
            },
          ]}
          onPressIn={() => setPressedCardId(item.id)}
          onPressOut={() => setPressedCardId(null)}
          onPress={() => handleSelectRestaurant(item)}
          accessibilityRole="button"
          accessibilityLabel={
            item.isCustom
              ? `Search for ${item.name} recipes`
              : `${item.name}${selectedRestaurant?.id === item.id ? ', selected' : ''}`
          }
          accessibilityState={{ selected: selectedRestaurant?.id === item.id }}
        >
          <Text style={styles.restaurantEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.restaurantName, { color: item.isCustom ? colors.primary : colors.foreground }]}>
              {item.isCustom ? `Search "${item.name}"` : item.name}
            </Text>
            {item.isCustom && (
              <Text style={[styles.customSubtext, { color: colors.muted }]}>
                Get recipes from any restaurant
              </Text>
            )}
          </View>
          <Feather
            name={item.isCustom ? 'arrow-right' : 'chevron-right'}
            size={20}
            color={
              item.isCustom
                ? colors.primary
                : selectedRestaurant?.id === item.id
                  ? colors.primary
                  : colors.muted
            }
          />
        </Pressable>
      </Animated.View>
    ),
    [selectedRestaurant, colors, handleSelectRestaurant, pressedCardId]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Feather name="search" size={48} color={colors.muted} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Search any restaurant
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
          Type a restaurant name above to find recipes
        </Text>
      </View>
    ),
    [colors]
  );

  const isCustomSelected = selectedRestaurant?.isCustom === true;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={Gradients.premium}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Restaurant Recipes</Text>
            <Text style={styles.headerSubtitle}>
              Homemade versions of your favorites
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close restaurant recipes"
            accessibilityRole="button"
          >
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Trial Badge - High contrast */}
        {!isPremium && !trialUsed && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.trialBadge}>
            <Feather name="gift" size={16} color="white" />
            <Text style={styles.trialText}>1 free recipe trial available</Text>
          </Animated.View>
        )}

        {/* Locked Badge */}
        {isLocked && (
          <TouchableOpacity
            onPress={handleUpgrade}
            style={styles.lockedBadge}
            accessibilityLabel="Upgrade to unlock unlimited recipes"
            accessibilityRole="button"
          >
            <Feather name="lock" size={14} color="white" />
            <Text style={styles.lockedBadgeText}>Tap to unlock unlimited recipes</Text>
            <Feather name="chevron-right" size={14} color="white" />
          </TouchableOpacity>
        )}

        <View style={styles.searchContainer}>
          <GlassInput
            placeholder="Search any restaurant..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Feather name="search" size={18} color="rgba(255,255,255,0.7)" />}
            accessibilityLabel="Search for a restaurant"
            accessibilityHint="Type any restaurant name to get recipes"
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Restaurant List */}
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: selectedRestaurant ? 320 : insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
        />

        {/* Selected Restaurant Dishes Panel */}
        {selectedRestaurant && (
          <Animated.View
            entering={FadeInDown.springify().damping(20)}
            style={styles.dishesPanelWrapper}
          >
            <GlassView
              intensity="strong"
              style={[
                styles.dishesPanel,
                { paddingBottom: insets.bottom + 20 },
              ]}
            >
              {/* Drag handle */}
              <View style={styles.dragHandle} />

              {/* Dismiss button */}
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismissPanel}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close dishes panel"
                accessibilityRole="button"
              >
                <Feather name="chevron-down" size={20} color={colors.muted} />
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.dishesPanelHeader}>
                  <Text style={styles.dishesEmoji}>{selectedRestaurant.emoji}</Text>
                  <Text style={[styles.dishesTitle, { color: colors.foreground }]}>
                    {selectedRestaurant.name}
                  </Text>
                </View>

                {isCustomSelected ? (
                  <>
                    <Text style={[styles.dishesSubtitle, { color: colors.muted }]}>
                      Enter a dish name or get a popular recipe
                    </Text>

                    {/* Custom dish input */}
                    <View style={[styles.customDishInput, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
                      <TextInput
                        ref={dishInputRef}
                        style={[styles.customDishTextInput, { color: colors.foreground }]}
                        placeholder="e.g., Big Mac, Whopper..."
                        placeholderTextColor={colors.muted}
                        value={customDishQuery}
                        onChangeText={setCustomDishQuery}
                        onSubmitEditing={handleCustomDishSubmit}
                        returnKeyType="go"
                        autoFocus
                      />
                      {customDishQuery.trim().length > 0 && (
                        <TouchableOpacity
                          style={[styles.customDishButton, { backgroundColor: colors.primary }]}
                          onPress={handleCustomDishSubmit}
                        >
                          <Text style={styles.getRecipeText}>Get Recipe</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Quick action: get popular recipe */}
                    <TouchableOpacity
                      style={[
                        styles.dishItem,
                        { backgroundColor: colors.primary + '10' },
                        isLocked && styles.dishItemLocked,
                      ]}
                      onPress={handleGetPopularRecipes}
                      accessibilityRole="button"
                      accessibilityLabel={`Get popular recipes from ${selectedRestaurant.name}`}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dishName, { color: colors.primary }]}>
                          Get Most Popular Recipe
                        </Text>
                        <Text style={[styles.dishHint, { color: colors.muted }]}>
                          Let AI suggest the best dish
                        </Text>
                      </View>
                      {isLocked ? (
                        <View style={[styles.lockedButton, { backgroundColor: colors.muted }]}>
                          <Feather name="lock" size={14} color="white" />
                        </View>
                      ) : (
                        <View style={[styles.getRecipeButton, { backgroundColor: colors.primary }]}>
                          <Feather name="zap" size={14} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.dishesSubtitle, { color: colors.muted }]}>
                      Popular dishes
                    </Text>

                    {selectedRestaurant.popularDishes.map((dish) => (
                      <TouchableOpacity
                        key={dish}
                        style={[
                          styles.dishItem,
                          { backgroundColor: colors.glassBackground },
                          isLocked && styles.dishItemLocked,
                        ]}
                        onPress={() => handleGetRecipe(dish)}
                        accessibilityRole="button"
                        accessibilityLabel={`Get recipe for ${dish}${isLocked ? ', premium required' : ''}`}
                        accessibilityState={{ disabled: isLocked }}
                      >
                        <Text style={[styles.dishName, { color: colors.foreground }]}>{dish}</Text>
                        {isLocked ? (
                          <View style={[styles.lockedButton, { backgroundColor: colors.muted }]}>
                            <Feather name="lock" size={14} color="white" />
                          </View>
                        ) : (
                          <View style={[styles.getRecipeButton, { backgroundColor: colors.primary }]}>
                            <Text style={styles.getRecipeText}>Get Recipe</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Premium prompt */}
                {isLocked && (
                  <TouchableOpacity
                    style={[styles.premiumPrompt, { backgroundColor: colors.primary + '15' }]}
                    onPress={handleUpgrade}
                    accessibilityRole="button"
                    accessibilityLabel="Upgrade to Premium for unlimited restaurant recipes"
                  >
                    <Feather name="zap" size={18} color={colors.primary} />
                    <Text style={[styles.premiumText, { color: colors.primary }]}>
                      Upgrade for unlimited recipes
                    </Text>
                    <Feather name="chevron-right" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </GlassView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Premium gradient header
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 4,
  },
  // Trial badge - solid background for contrast
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  trialText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Locked badge
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  lockedBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    flex: 1,
  },
  searchContainer: {
    marginTop: 4,
  },
  // Content
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  // Restaurant card
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    minHeight: 60,
  },
  restaurantEmoji: {
    fontSize: 24,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  customSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
  },
  // Dishes panel wrapper (absolute positioning)
  dishesPanelWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '55%',
  },
  // Dishes panel (visual styles)
  dishesPanel: {
    padding: 20,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  dishesPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  dishesEmoji: {
    fontSize: 28,
  },
  dishesTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  dishesSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  // Custom dish input
  customDishInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  customDishTextInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  customDishButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 4,
    marginVertical: 4,
    borderRadius: 10,
    justifyContent: 'center',
  },
  dishHint: {
    fontSize: 12,
    marginTop: 2,
  },
  // Dish item
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    minHeight: 52,
  },
  dishItemLocked: {
    opacity: 0.7,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  getRecipeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getRecipeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  lockedButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Premium prompt
  premiumPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 6,
  },
  premiumText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
