import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { Colors, Gradients, Shadows, EditorialColors } from '@/theme';
import { Message, Recipe } from '@/types';

interface MessageBubbleProps {
  message: Message;
  renderRecipeCard?: (recipe: Recipe) => React.ReactNode;
  index?: number;
}

export default function MessageBubble({ message, renderRecipeCard, index = 0 }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const isUser = message.role === 'user';

  // Subtle fade-up animation with 300ms duration
  const enteringAnimation = FadeInUp
    .duration(300)
    .delay(index * 50)
    .springify()
    .damping(18)
    .stiffness(100);

  if (isUser) {
    return (
      <Animated.View
        entering={enteringAnimation}
        style={[styles.container, styles.userContainer]}
      >
        <LinearGradient
          colors={Gradients.userMessage}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble, Shadows.md]}
        >
          <Text style={styles.userText}>{message.content}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Assistant message - Clean editorial card style (no glass)
  return (
    <Animated.View
      entering={enteringAnimation}
      style={[styles.container, styles.assistantContainer]}
    >
      <View
        style={[
          styles.bubble,
          styles.assistantBubble,
          {
            backgroundColor: isDark ? colors.card : colors.assistantBubble,
            borderColor: colors.borderLight,
          },
          Shadows.card,
        ]}
      >
        {/* Warm gold/terracotta left accent border */}
        <View
          style={[
            styles.accentBorder,
            { backgroundColor: isDark ? colors.accent : colors.primary }
          ]}
        />

        {/* Message content - Clean typography, no header */}
        <View style={styles.contentContainer}>
          <Text style={[styles.assistantText, { color: colors.foreground }]}>
            {message.content}
          </Text>

          {/* Recipe card if present */}
          {message.recipe && renderRecipeCard && (
            <View style={styles.recipeContainer}>
              {renderRecipeCard(message.recipe)}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// Animated dot component for loading - Terracotta themed
function AnimatedDot({ delay, isPrimary }: { delay: number; isPrimary: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 350 }),
          withTiming(1, { duration: 350 })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350 }),
          withTiming(0.4, { duration: 350 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Terracotta color scheme for dots
  const dotColor = isPrimary
    ? colors.primary
    : (isDark ? colors.accent : EditorialColors.gold);

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: dotColor }, animatedStyle]}
    />
  );
}

// Loading bubble component - Elegant, minimal
export function LoadingBubble() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify().damping(18).stiffness(100)}
      style={[styles.container, styles.assistantContainer]}
    >
      <View
        style={[
          styles.bubble,
          styles.assistantBubble,
          styles.loadingBubble,
          {
            backgroundColor: isDark ? colors.card : colors.assistantBubble,
            borderColor: colors.borderLight,
          },
          Shadows.card,
        ]}
      >
        {/* Warm accent border */}
        <View
          style={[
            styles.accentBorder,
            { backgroundColor: isDark ? colors.accent : colors.primary }
          ]}
        />

        <View style={styles.loadingContent}>
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} isPrimary={true} />
            <AnimatedDot delay={120} isPrimary={false} />
            <AnimatedDot delay={240} isPrimary={true} />
          </View>
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Preparing your recipe...
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  userBubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderBottomLeftRadius: 6,
    flexDirection: 'row',
  },
  loadingBubble: {
    minWidth: 160,
  },
  accentBorder: {
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 6,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 14,
  },
  userText: {
    color: '#faf8f5',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
  },
  recipeContainer: {
    marginTop: 14,
  },
  loadingContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
