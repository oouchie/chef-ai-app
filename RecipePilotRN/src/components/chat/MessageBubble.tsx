import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
        entering={FadeInUp.duration(300)}
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
      entering={FadeInUp.duration(300)}
      style={[styles.container, styles.assistantContainer]}
    >
      <View
        style={[
          styles.bubble,
          styles.assistantBubble,
          {
            backgroundColor: colors.glassBackgroundStrong,
            borderColor: colors.glassBorder,
          },
          Shadows.glassCard,
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={20}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Header with avatar */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.avatarEmoji}>👨‍🍳</Text>
          </View>
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

// Loading bubble component
export function LoadingBubble() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[styles.container, styles.assistantContainer]}
    >
      <View
        style={[
          styles.bubble,
          styles.assistantBubble,
          {
            backgroundColor: colors.glassBackgroundStrong,
            borderColor: colors.glassBorder,
          },
          Shadows.glassCard,
        ]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.avatarEmoji}>👨‍🍳</Text>
          </View>
          <Text style={[styles.assistantName, { color: colors.primary }]}>
            RecipePilot
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                { backgroundColor: colors.primary },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                { backgroundColor: colors.accent },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                { backgroundColor: colors.secondary },
              ]}
            />
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
    borderLeftColor: '#ff6b35',
    borderBottomLeftRadius: 6,
  },
  userText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
