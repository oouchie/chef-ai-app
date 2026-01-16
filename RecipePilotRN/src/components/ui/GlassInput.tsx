import React, { useState, useRef, useCallback } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '@/theme';
import { Shadows } from '@/theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function GlassInput({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: GlassInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const focusProgress = useSharedValue(0);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  }, [onBlur]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.glassBorder, colors.primary]
    ),
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: focusProgress.value * 0.35,
    shadowRadius: 15 * focusProgress.value,
  }));

  const backgroundColor = isDark
    ? 'rgba(20, 20, 20, 0.75)'
    : 'rgba(255, 255, 255, 0.75)';

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.container,
          animatedBorderStyle,
          Platform.OS === 'ios' && animatedShadowStyle,
          { shadowColor: colors.primary },
          error && styles.errorBorder,
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : null}

        <View style={[styles.inputContainer, { backgroundColor: Platform.OS === 'android' ? backgroundColor : 'transparent' }]}>
          {icon && <View style={styles.icon}>{icon}</View>}

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: colors.foreground },
              icon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              style,
            ]}
            placeholderTextColor={colors.muted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={onRightIconPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

// Multi-line text area variant
export function GlassTextArea({
  numberOfLines = 4,
  ...props
}: GlassInputProps & { numberOfLines?: number }) {
  return (
    <GlassInput
      {...props}
      multiline
      numberOfLines={numberOfLines}
      style={[{ minHeight: numberOfLines * 24, textAlignVertical: 'top' }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  icon: {
    paddingLeft: 16,
  },
  rightIcon: {
    paddingRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
