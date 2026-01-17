import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import { Colors, Gradients, Shadows } from '@/theme';
import { Message, Recipe } from '@/types';

interface MessageBubbleProps {
  message: Message;
  renderRecipeCard?: (recipe: Recipe) => React.ReactNode;
}

export default function MessageBubble({ message, renderRecipeCard }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Animated.View
        entering={FadeInUp.springify().damping(20).stiffness(90)}
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

  // Assistant message
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(90)}
      style={[styles.container, styles.assistantContainer]}
    >
      <View
        style={[
          styles.bubble,
          styles.assistantBubble,
          {
            backgroundColor: colors.glassBackgroundStrong,
            borderColor: colors.glassBorder,
            borderLeftColor: colors.primary,
          },
          Shadows.glassCard,
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={25}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Header with avatar */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarEmoji}>👨‍🍳</Text>
          </LinearGradient>
          <Text style={[styles.assistantName, { color: colors.primary }]}>
            RecipePilot
          </Text>
        </View>

        {/* Message content */}
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
    </Animated.View>
  );
}

// Animated dot component for loading
function AnimatedDot({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.4, { duration: 300 })
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

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color }, animatedStyle]}
    />
  );
}

// Loading bubble component
export function LoadingBubble() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(20).stiffness(90)}
      style={[styles.container, styles.assistantContainer]}
    >
      <View
        style={[
          styles.bubble,
          styles.assistantBubble,
          {
            backgroundColor: colors.glassBackgroundStrong,
            borderColor: colors.glassBorder,
            borderLeftColor: colors.primary,
          },
          Shadows.glassCard,
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={25}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarEmoji}>👨‍🍳</Text>
          </LinearGradient>
          <Text style={[styles.assistantName, { color: colors.primary }]}>
            RecipePilot
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} color={colors.primary} />
            <AnimatedDot delay={150} color={colors.primaryLight || colors.primary} />
            <AnimatedDot delay={300} color={colors.secondary} />
          </View>
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Cooking up something delicious...
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  userText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  avatarGradient: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  assistantName: {
    fontSize: 14,
    fontWeight: '600',
  },
  assistantText: {
    padding: 16,
    paddingTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  recipeContainer: {
    padding: 12,
    paddingTop: 0,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'flex-start',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
