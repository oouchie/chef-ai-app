import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gradients, GradientKey } from '@/theme';
import { Shadows } from '@/theme';
import { hapticLight } from '@/lib/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'rose' | 'success' | 'premium';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  withGlow?: boolean;
}

const variantGradients: Record<ButtonVariant, readonly [string, string, ...string[]]> = {
  primary: Gradients.primary,
  secondary: Gradients.secondary,
  rose: Gradients.rose,
  success: Gradients.success,
  premium: Gradients.premium,
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 18 },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GradientButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  withGlow = true,
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
    hapticLight();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const sizeConfig = sizeStyles[size];
  const gradientColors = variantGradients[variant];

  const glowShadow = withGlow
    ? variant === 'primary'
      ? Shadows.glowPrimary
      : variant === 'secondary'
      ? Shadows.glowSecondary
      : variant === 'rose'
      ? Shadows.glowRose
      : Shadows.glowPrimary
    : {};

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        animatedStyle,
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        glowShadow,
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
            )}
            <Text
              style={[
                styles.text,
                { fontSize: sizeConfig.fontSize },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Animated.View style={styles.iconRight}>{icon}</Animated.View>
            )}
          </>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

// Icon-only variant
export function GradientIconButton({
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: Omit<GradientButtonProps, 'title'> & { icon: React.ReactNode }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    hapticLight();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const sizeMap = { sm: 36, md: 44, lg: 52 };
  const buttonSize = sizeMap[size];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[animatedStyle, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={variantGradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconButton,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        ]}
      >
        {icon}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
