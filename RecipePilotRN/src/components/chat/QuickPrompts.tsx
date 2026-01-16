import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Colors, Shadows } from '@/theme';
import { QUICK_PROMPTS } from '@/types';
import { hapticLight } from '@/lib/haptics';
import { GlassCard } from '@/components/ui';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isPremium?: boolean;
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
    <View style={styles.container}>
      {/* Logo and Title */}
      <Animated.View
        entering={FadeInUp.delay(0).duration(400)}
        style={styles.header}
      >
        <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
          <Text style={styles.logoEmoji}>👨‍🍳</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Welcome to RecipePilot!
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Your AI-powered culinary companion. Ask me for recipes from around the world,
          ingredient substitutions, cooking techniques, or meal planning!
        </Text>
      </Animated.View>

      {/* Quick Prompts Grid */}
      <View style={styles.grid}>
        {QUICK_PROMPTS.map((prompt, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(100 + index * 50).duration(300)}
            style={styles.gridItem}
          >
            <TouchableOpacity
              style={[
                styles.promptCard,
                {
                  backgroundColor: colors.glassBackgroundStrong,
                  borderColor: colors.glassBorder,
                },
                Shadows.sm,
              ]}
              onPress={() => handlePromptPress(prompt)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.promptText, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {prompt}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Premium Badge */}
      {isPremium && (
        <Animated.View
          entering={FadeInUp.delay(500).duration(300)}
          style={[styles.premiumBadge, { backgroundColor: colors.primary + '15' }]}
        >
          <Text style={styles.premiumStar}>⭐</Text>
          <Text style={[styles.premiumText, { color: colors.primary }]}>
            Premium Member
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  promptCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 30,
    gap: 6,
  },
  premiumStar: {
    fontSize: 16,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
