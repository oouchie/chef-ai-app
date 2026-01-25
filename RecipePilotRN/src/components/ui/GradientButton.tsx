import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gradients, GradientKey } from '@/theme';
import { Shadows } from '@/theme';
import { Colors, EditorialColors } from '@/theme';
import { hapticLight } from '@/lib/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'premium' | 'outline' | 'ghost';
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
  withShadow?: boolean;
}

const variantGradients: Record<Exclude<ButtonVariant, 'outline' | 'ghost'>, readonly [string, string, ...string[]]> = {
  primary: Gradients.primary,
  secondary: Gradients.secondary,
  accent: Gradients.accent,
  success: Gradients.success,
  premium: Gradients.premium,
};

const sizeStyles: Record<ButtonSize, {
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
  borderRadius: number;
  letterSpacing: number;
}> = {
  sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13, borderRadius: 10, letterSpacing: 0.3 },
  md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15, borderRadius: 12, letterSpacing: 0.4 },
  lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17, borderRadius: 14, letterSpacing: 0.5 },
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
  withShadow = true,
}: GradientButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
    opacity.value = withTiming(0.92, { duration: 80 });
    hapticLight();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 80 });
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const sizeConfig = sizeStyles[size];
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  // Get shadow based on variant
  const getShadow = () => {
    if (!withShadow || isGhost) return {};
    if (isOutline) return Shadows.sm;
    return Shadows.button;
  };

  // Outline variant
  if (isOutline) {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          animatedStyle,
          styles.outlineContainer,
          {
            borderRadius: sizeConfig.borderRadius,
            borderColor: colors.primary,
          },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          getShadow(),
          style,
        ]}
      >
        <View
          style={[
            styles.outlineInner,
            {
              paddingVertical: sizeConfig.paddingVertical,
              paddingHorizontal: sizeConfig.paddingHorizontal,
              borderRadius: sizeConfig.borderRadius - 2,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
              )}
              <Text
                style={[
                  styles.outlineText,
                  {
                    fontSize: sizeConfig.fontSize,
                    letterSpacing: sizeConfig.letterSpacing,
                    color: colors.primary,
                  },
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
        </View>
      </AnimatedTouchable>
    );
  }

  // Ghost variant
  if (isGhost) {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          animatedStyle,
          styles.ghostContainer,
          {
            borderRadius: sizeConfig.borderRadius,
          },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        <View
          style={[
            styles.ghostInner,
            {
              paddingVertical: sizeConfig.paddingVertical - 2,
              paddingHorizontal: sizeConfig.paddingHorizontal - 4,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.muted} size="small" />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
              )}
              <Text
                style={[
                  styles.ghostText,
                  {
                    fontSize: sizeConfig.fontSize,
                    letterSpacing: sizeConfig.letterSpacing,
                    color: colors.muted,
                  },
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
        </View>
      </AnimatedTouchable>
    );
  }

  // Standard gradient variants
  const gradientColors = variantGradients[variant as Exclude<ButtonVariant, 'outline' | 'ghost'>];

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
        { borderRadius: sizeConfig.borderRadius },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        getShadow(),
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
            borderRadius: sizeConfig.borderRadius,
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
                {
                  fontSize: sizeConfig.fontSize,
                  letterSpacing: sizeConfig.letterSpacing,
                },
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
    scale.value = withSpring(0.9, { damping: 20, stiffness: 400 });
    hapticLight();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
  }, []);

  const sizeMap = { sm: 38, md: 46, lg: 54 };
  const radiusMap = { sm: 10, md: 12, lg: 14 };
  const buttonSize = sizeMap[size];
  const borderRadius = radiusMap[size];

  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  if (isOutline || isGhost) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          animatedStyle,
          disabled && styles.disabled,
          isOutline ? [styles.iconButtonOutline, { width: buttonSize, height: buttonSize, borderRadius }] : undefined,
          style,
        ]}
      >
        <View
          style={[
            styles.iconButtonInner,
            { width: buttonSize, height: buttonSize, borderRadius },
          ]}
        >
          {icon}
        </View>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[
        animatedStyle,
        disabled && styles.disabled,
        Shadows.button,
        style,
      ]}
    >
      <LinearGradient
        colors={variantGradients[variant as Exclude<ButtonVariant, 'outline' | 'ghost'>]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconButton,
          { width: buttonSize, height: buttonSize, borderRadius },
        ]}
      >
        {icon}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Outline variant styles
  outlineContainer: {
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  outlineInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Ghost variant styles
  ghostContainer: {
    overflow: 'hidden',
  },
  ghostInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  // Icon button variants
  iconButtonOutline: {
    borderWidth: 1.5,
    borderColor: EditorialColors.terracotta,
  },
  iconButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
