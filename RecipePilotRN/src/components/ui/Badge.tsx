import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/theme';
import { Shadows } from '@/theme';

type BadgeVariant = 'easy' | 'medium' | 'hard' | 'primary' | 'secondary' | 'success' | 'warning' | 'premium';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const variantGradients: Record<BadgeVariant, readonly [string, string, ...string[]]> = {
  easy: Gradients.easy,
  medium: Gradients.medium,
  hard: Gradients.hard,
  primary: Gradients.primary,
  secondary: Gradients.secondary,
  success: Gradients.success,
  warning: Gradients.warning,
  premium: Gradients.premium,
};

const sizeStyles: Record<BadgeSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
  sm: { paddingVertical: 2, paddingHorizontal: 8, fontSize: 10, borderRadius: 10 },
  md: { paddingVertical: 4, paddingHorizontal: 12, fontSize: 12, borderRadius: 12 },
  lg: { paddingVertical: 6, paddingHorizontal: 16, fontSize: 14, borderRadius: 14 },
};

export default function Badge({
  text,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const sizeConfig = sizeStyles[size];
  const gradientColors = variantGradients[variant];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.badge,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
        },
        Shadows.sm,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { fontSize: sizeConfig.fontSize },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </LinearGradient>
  );
}

// Difficulty badge helper
export function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const variant = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
  return <Badge text={difficulty} variant={variant} size="sm" />;
}

// Region badge
export function RegionBadge({ region, flag }: { region: string; flag: string }) {
  return (
    <Badge
      text={`${flag} ${region}`}
      variant="secondary"
      size="sm"
    />
  );
}

// Premium badge
export function PremiumBadge() {
  return (
    <Badge
      text="Premium"
      variant="premium"
      size="sm"
      icon={
        <Text style={styles.starIcon}>⭐</Text>
      }
    />
  );
}

// Time badge
export function TimeBadge({ time, icon }: { time: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.timeBadge}>
      {icon}
      <Text style={styles.timeText}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  icon: {
    marginRight: 4,
  },
  starIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
});
