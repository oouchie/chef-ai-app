import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/theme';
import { useToast } from '@/components/Toast';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { hasUsedRestaurantTrial, markRestaurantTrialUsed } from '@/lib/storage';
import { GlassView, GradientButton, GlassInput } from '@/components/ui';

interface Restaurant {
  id: string;
  name: string;
  emoji: string;
  popularDishes: string[];
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const isPremium = false; // TODO: Add premium check

  React.useEffect(() => {
    const checkTrial = async () => {
      const used = await hasUsedRestaurantTrial();
      setTrialUsed(used);
    };
    checkTrial();
  }, []);

  const filteredRestaurants = POPULAR_RESTAURANTS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    hapticLight();
    setSelectedRestaurant(restaurant);
  }, []);

  const handleGetRecipe = useCallback(async (dishName: string) => {
    if (!isPremium && trialUsed) {
      router.push('/(modals)/paywall');
      return;
    }

    if (!isPremium) {
      await markRestaurantTrialUsed();
      setTrialUsed(true);
    }

    hapticSuccess();
    showToast(`Getting recipe for ${dishName}...`, 'info');

    // Navigate back to chat and send the message
    router.replace({
      pathname: '/(tabs)/chat',
    });

    // TODO: Send message to chat
    // The chat screen should handle this via a parameter or global state
  }, [isPremium, trialUsed, showToast]);

  const renderRestaurant = useCallback(
    ({ item, index }: { item: Restaurant; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <TouchableOpacity
          style={[
            styles.restaurantCard,
            {
              backgroundColor:
                selectedRestaurant?.id === item.id
                  ? colors.primary + '15'
                  : colors.glassBackgroundStrong,
              borderColor:
                selectedRestaurant?.id === item.id ? colors.primary : colors.glassBorder,
            },
          ]}
          onPress={() => handleSelectRestaurant(item)}
        >
          <Text style={styles.restaurantEmoji}>{item.emoji}</Text>
          <Text style={[styles.restaurantName, { color: colors.foreground }]}>
            {item.name}
          </Text>
          <Feather
            name="chevron-right"
            size={20}
            color={selectedRestaurant?.id === item.id ? colors.primary : colors.muted}
          />
        </TouchableOpacity>
      </Animated.View>
    ),
    [selectedRestaurant, colors, handleSelectRestaurant]
  );

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
              Restaurant Recipes
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              Homemade versions of your favorites
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {!isPremium && !trialUsed && (
          <View style={[styles.trialBadge, { backgroundColor: colors.accent + '20' }]}>
            <Feather name="gift" size={16} color={colors.accent} />
            <Text style={[styles.trialText, { color: colors.accent }]}>
              1 free recipe trial available
            </Text>
          </View>
        )}

        <GlassInput
          placeholder="Search restaurants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Feather name="search" size={18} color={colors.muted} />}
        />
      </GlassView>

      <View style={styles.content}>
        {/* Restaurant List */}
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: selectedRestaurant ? 280 : insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />

        {/* Selected Restaurant Dishes - Fixed at bottom with safe area */}
        {selectedRestaurant && (
          <GlassView
            intensity="strong"
            style={[
              styles.dishesPanel,
              { paddingBottom: insets.bottom + 20, maxHeight: '55%' },
            ]}
          >
            <View style={styles.dishesPanelHeader}>
              <Text style={styles.dishesEmoji}>{selectedRestaurant.emoji}</Text>
              <Text style={[styles.dishesTitle, { color: colors.foreground }]}>
                {selectedRestaurant.name}
              </Text>
            </View>

            <Text style={[styles.dishesSubtitle, { color: colors.muted }]}>
              Popular dishes
            </Text>

            {selectedRestaurant.popularDishes.map((dish, index) => (
              <TouchableOpacity
                key={dish}
                style={[
                  styles.dishItem,
                  { backgroundColor: colors.glassBackground },
                ]}
                onPress={() => handleGetRecipe(dish)}
              >
                <Text style={[styles.dishName, { color: colors.foreground }]}>{dish}</Text>
                <View style={[styles.getRecipeButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.getRecipeText}>Get Recipe</Text>
                </View>
              </TouchableOpacity>
            ))}

            {!isPremium && trialUsed && (
              <View style={[styles.premiumPrompt, { backgroundColor: colors.primary + '10' }]}>
                <Feather name="lock" size={18} color={colors.primary} />
                <Text style={[styles.premiumText, { color: colors.primary }]}>
                  Upgrade to Premium for unlimited restaurant recipes
                </Text>
              </View>
            )}
          </GlassView>
        )}
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  trialText: {
    fontSize: 13,
    fontWeight: '500',
  },
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
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  restaurantEmoji: {
    fontSize: 24,
  },
  restaurantName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  dishesPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
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
  },
  dishesSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  getRecipeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  getRecipeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
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
    fontWeight: '500',
  },
});
