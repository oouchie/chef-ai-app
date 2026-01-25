import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Shadows, Gradients, EditorialColors } from '@/theme';
import { hapticLight } from '@/lib/haptics';

// Categorized prompts with icons
const PROMPT_CATEGORIES = [
  {
    title: 'Popular',
    icon: 'trending-up' as const,
    prompts: [
      { text: 'Quick weeknight dinner ideas', icon: 'clock' as const },
      { text: 'What can I make with chicken?', icon: 'help-circle' as const },
    ],
  },
  {
    title: 'Quick Meals',
    icon: 'zap' as const,
    prompts: [
      { text: '15-minute pasta recipes', icon: 'clock' as const },
      { text: 'Easy one-pan dinners', icon: 'layers' as const },
    ],
  },
  {
    title: 'Cuisines',
    icon: 'globe' as const,
    prompts: [
      { text: 'Authentic Italian dishes', icon: 'flag' as const },
      { text: 'Traditional Thai recipes', icon: 'flag' as const },
    ],
  },
  {
    title: 'Dietary',
    icon: 'heart' as const,
    prompts: [
      { text: 'Healthy vegetarian meals', icon: 'sun' as const },
      { text: 'High-protein recipes', icon: 'activity' as const },
    ],
  },
];

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isPremium?: boolean;
}

// Animated chip component
function PromptChip({
  prompt,
  icon,
  onPress,
  index,
  categoryIndex,
}: {
  prompt: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  index: number;
  categoryIndex: number;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Staggered animation delay based on position
  const delay = (categoryIndex * 100) + (index * 80);

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).duration(400).springify().damping(15)}
    >
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: isDark
              ? colors.card
              : colors.cardElevated,
            borderColor: pressed
              ? colors.primary
              : colors.borderLight,
          },
          pressed && styles.chipPressed,
          Shadows.sm,
        ]}
        onPress={onPress}
      >
        <View style={[styles.chipIcon, { backgroundColor: colors.primary + '12' }]}>
          <Feather name={icon} size={14} color={colors.primary} />
        </View>
        <Text
          style={[styles.chipText, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {prompt}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function QuickPrompts({ onSelectPrompt, isPremium = false }: QuickPromptsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handlePromptPress = (prompt: string) => {
    hapticLight();
    onSelectPrompt(prompt);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section - Editorial style */}
      <Animated.View
        entering={FadeInUp.delay(100).duration(500).springify()}
        style={styles.header}
      >
        {/* Elegant culinary illustration placeholder */}
        <View style={[styles.illustrationContainer, { backgroundColor: colors.primary + '08' }]}>
          <View style={styles.illustrationRow}>
            <View style={[styles.illustrationIcon, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="book-open" size={28} color={colors.primary} />
            </View>
            <View style={[styles.illustrationIcon, { backgroundColor: colors.accent + '15' }]}>
              <Feather name="coffee" size={28} color={colors.accent} />
            </View>
            <View style={[styles.illustrationIcon, { backgroundColor: colors.secondary + '15' }]}>
              <Feather name="award" size={28} color={colors.secondary} />
            </View>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Your Culinary Journey
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Discover recipes from around the world.{'\n'}
          What would you like to cook today?
        </Text>
      </Animated.View>

      {/* Prompt Categories with Horizontal Scroll Chips */}
      {PROMPT_CATEGORIES.map((category, categoryIndex) => (
        <Animated.View
          key={category.title}
          entering={FadeInUp.delay(200 + categoryIndex * 100).duration(400)}
          style={styles.categorySection}
        >
          {/* Category Header */}
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIconBg, { backgroundColor: colors.primary + '10' }]}>
              <Feather name={category.icon} size={14} color={colors.primary} />
            </View>
            <Text style={[styles.categoryTitle, { color: colors.foreground }]}>
              {category.title}
            </Text>
          </View>

          {/* Horizontal Scroll Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {/* Left fade edge */}
            {category.prompts.map((prompt, index) => (
              <PromptChip
                key={prompt.text}
                prompt={prompt.text}
                icon={prompt.icon}
                onPress={() => handlePromptPress(prompt.text)}
                index={index}
                categoryIndex={categoryIndex}
              />
            ))}
          </ScrollView>
        </Animated.View>
      ))}

      {/* Premium Badge */}
      {isPremium && (
        <Animated.View
          entering={FadeInUp.delay(600).duration(400)}
          style={[styles.premiumBadge, { backgroundColor: colors.accent + '15' }]}
        >
          <LinearGradient
            colors={Gradients.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumIconBg}
          >
            <Feather name="star" size={12} color="white" />
          </LinearGradient>
          <Text style={[styles.premiumText, { color: colors.accent }]}>
            Premium Member
          </Text>
        </Animated.View>
      )}

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  illustrationContainer: {
    width: '100%',
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationRow: {
    flexDirection: 'row',
    gap: 20,
  },
  illustrationIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  categoryIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    maxWidth: 220,
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 8,
    gap: 8,
  },
  premiumIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
