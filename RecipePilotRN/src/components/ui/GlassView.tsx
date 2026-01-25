import React from 'react';
import { View, ViewStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Shadows } from '@/theme';
import { EditorialColors } from '@/theme';

type GlassIntensity = 'light' | 'medium' | 'strong' | 'warm';

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: GlassIntensity;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  animated?: boolean;
  animationType?: 'fade' | 'slideUp' | 'slideDown';
  animationDelay?: number;
  warmTint?: boolean;
}

// Refined blur settings - slightly less on iOS for better performance
const intensitySettings = {
  light: { blur: 16, opacity: 0.78 },
  medium: { blur: 28, opacity: 0.86 },
  strong: { blur: 40, opacity: 0.92 },
  warm: { blur: 24, opacity: 0.88 },
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
  warmTint = false,
}: GlassViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const settings = intensitySettings[intensity];

  // Warm cream-based backgrounds instead of pure white
  const getBackgroundColor = () => {
    if (intensity === 'warm' || warmTint) {
      return isDark
        ? EditorialColors.glassWarmDark
        : EditorialColors.glassWarmLight;
    }
    return isDark
      ? `rgba(26, 22, 20, ${settings.opacity})`
      : `rgba(250, 248, 245, ${settings.opacity})`;
  };

  // Softer borders with warm undertone
  const getBorderColor = () => {
    if (intensity === 'warm' || warmTint) {
      return isDark
        ? EditorialColors.glassBorderWarmDark
        : EditorialColors.glassBorderWarmLight;
    }
    return isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(232, 226, 219, 0.5)';
  };

  const backgroundColor = getBackgroundColor();
  const borderColor = getBorderColor();

  const flatStyle = StyleSheet.flatten(style) || {};
  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor,
    ...Shadows.glass,
    ...flatStyle,
  };

  const enteringAnimation = animated
    ? animationType === 'slideUp'
      ? FadeInUp.delay(animationDelay).duration(350).springify().damping(18)
      : animationType === 'slideDown'
      ? FadeInDown.delay(animationDelay).duration(350).springify().damping(18)
      : FadeIn.delay(animationDelay).duration(280)
    : undefined;

  // On iOS, use BlurView for real glassmorphism with refined blur
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

// Glass Card variant with editorial styling
export function GlassCard({
  children,
  style,
  onPress,
  warmTint = true,
  ...props
}: GlassViewProps & { onPress?: () => void }) {
  const flatStyle = StyleSheet.flatten([{ padding: 16 }, style]);
  return (
    <GlassView
      intensity="medium"
      warmTint={warmTint}
      style={flatStyle}
      borderRadius={14}
      {...props}
    >
      {children}
    </GlassView>
  );
}

// Glass Panel for sidebars and modals - warm editorial feel
export function GlassPanel({
  children,
  style,
  ...props
}: GlassViewProps) {
  return (
    <GlassView
      intensity="strong"
      warmTint
      borderRadius={0}
      style={style}
      {...props}
    >
      {children}
    </GlassView>
  );
}

// Warm Glass variant - specifically for editorial layouts
export function WarmGlassView({
  children,
  style,
  borderRadius = 16,
  ...props
}: Omit<GlassViewProps, 'intensity' | 'warmTint'>) {
  return (
    <GlassView
      intensity="warm"
      warmTint
      borderRadius={borderRadius}
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
