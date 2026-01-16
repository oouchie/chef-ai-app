import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/theme';
import { Shadows } from '@/theme';
import { hapticLight } from '@/lib/haptics';

interface GlassButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const sizeStyles = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 18, fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GlassButton({
  title,
  onPress,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  size = 'md',
  active = false,
}: GlassButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    hapticLight();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const sizeConfig = sizeStyles[size];
  const backgroundColor = isDark
    ? active ? 'rgba(255, 107, 53, 0.3)' : 'rgba(20, 20, 20, 0.75)'
    : active ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 255, 255, 0.75)';

  const borderColor = active ? colors.primary : colors.glassBorder;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[
        animatedStyle,
        styles.container,
        { borderColor },
        disabled && styles.disabled,
        Shadows.sm,
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View
        style={[
          styles.content,
          {
            backgroundColor: Platform.OS === 'android' ? backgroundColor : 'transparent',
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
          },
        ]}
      >
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        {title && (
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: active ? colors.primary : colors.foreground,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
        {icon && !title && icon}
      </View>
    </AnimatedTouchable>
  );
}

// Icon-only variant
export function GlassIconButton({
  icon,
  onPress,
  disabled = false,
  size = 'md',
  active = false,
  style,
}: Omit<GlassButtonProps, 'title'> & { icon: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

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

  const backgroundColor = isDark
    ? active ? 'rgba(255, 107, 53, 0.3)' : 'rgba(20, 20, 20, 0.75)'
    : active ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 255, 255, 0.75)';

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[
        animatedStyle,
        styles.iconButton,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          borderColor: active ? colors.primary : colors.glassBorder,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: buttonSize / 2 }]}
        />
      ) : null}
      <View
        style={[
          styles.iconContent,
          {
            backgroundColor: Platform.OS === 'android' ? backgroundColor : 'transparent',
            borderRadius: buttonSize / 2,
          },
        ]}
      >
        {icon}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
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
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
