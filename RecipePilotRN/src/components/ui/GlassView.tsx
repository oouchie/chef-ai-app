import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Shadows } from '@/theme';

type GlassIntensity = 'light' | 'medium' | 'strong';

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: GlassIntensity;
  style?: ViewStyle;
  borderRadius?: number;
  animated?: boolean;
  animationType?: 'fade' | 'slideUp' | 'slideDown';
  animationDelay?: number;
}

const intensitySettings = {
  light: { blur: 20, opacity: 0.75 },
  medium: { blur: 40, opacity: 0.85 },
  strong: { blur: 60, opacity: 0.95 },
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function GlassView({
  children,
  intensity = 'medium',
  style,
  borderRadius = 16,
  animated = false,
  animationType = 'fade',
  animationDelay = 0,
}: GlassViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const settings = intensitySettings[intensity];

  const backgroundColor = isDark
    ? `rgba(20, 20, 20, ${settings.opacity})`
    : `rgba(255, 255, 255, ${settings.opacity})`;

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(255, 255, 255, 0.4)';

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor,
    ...Shadows.glass,
    ...style,
  };

  const enteringAnimation = animated
    ? animationType === 'slideUp'
      ? FadeInUp.delay(animationDelay).duration(400)
      : animationType === 'slideDown'
      ? FadeInDown.delay(animationDelay).duration(400)
      : FadeIn.delay(animationDelay).duration(300)
    : undefined;

  // On iOS, use BlurView for real glassmorphism
  // On Android, use a semi-transparent background (BlurView performance is poor on Android)
  if (Platform.OS === 'ios') {
    return (
      <Animated.View entering={enteringAnimation} style={containerStyle}>
        <BlurView
          intensity={settings.blur}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.content, { backgroundColor }]}>
          {children}
        </View>
      </Animated.View>
    );
  }

  // Android fallback - just use semi-transparent background
  return (
    <Animated.View
      entering={enteringAnimation}
      style={[containerStyle, { backgroundColor }]}
    >
      {children}
    </Animated.View>
  );
}

// Glass Card variant with hover-like press effect
export function GlassCard({
  children,
  style,
  onPress,
  ...props
}: GlassViewProps & { onPress?: () => void }) {
  return (
    <GlassView
      intensity="strong"
      style={[{ padding: 16 }, style]}
      {...props}
    >
      {children}
    </GlassView>
  );
}

// Glass Panel for sidebars and modals
export function GlassPanel({
  children,
  style,
  ...props
}: GlassViewProps) {
  return (
    <GlassView
      intensity="strong"
      borderRadius={0}
      style={style}
      {...props}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
