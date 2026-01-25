import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/theme';
import { Shadows } from '@/theme';
import { Colors, EditorialColors } from '@/theme';

type BadgeVariant =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'premium';
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
  // Difficulty badges - culinary themed
  easy: Gradients.easy,       // Sage green
  medium: Gradients.medium,   // Gold
  hard: Gradients.hard,       // Terracotta

  // Standard variants
  primary: Gradients.primary,     // Terracotta
  secondary: Gradients.secondary, // Sage green
  accent: Gradients.accent,       // Gold
  success: Gradients.success,     // Sage green
  warning: Gradients.warning,     // Gold
  premium: Gradients.premium,     // Gold to terracotta
};

// More refined pill shape - less rounded for editorial feel
const sizeStyles: Record<BadgeSize, {
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
  borderRadius: number;
  letterSpacing: number;
}> = {
  sm: { paddingVertical: 3, paddingHorizontal: 10, fontSize: 10, borderRadius: 6, letterSpacing: 0.4 },
  md: { paddingVertical: 5, paddingHorizontal: 14, fontSize: 11, borderRadius: 8, letterSpacing: 0.5 },
  lg: { paddingVertical: 7, paddingHorizontal: 18, fontSize: 13, borderRadius: 10, letterSpacing: 0.5 },
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
    <View style={[styles.wrapper, style]}>
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
        ]}
      >
        {/* Inner subtle shadow for depth */}
        <View style={styles.innerShadow} />
        {icon && <View style={styles.icon}>{icon}</View>}
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
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
}

// Difficulty badge helper - culinary themed colors
export function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const variant = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
  return <Badge text={difficulty} variant={variant} size="sm" />;
}

// Region badge - uses secondary (sage green)
export function RegionBadge({ region, flag }: { region: string; flag: string }) {
  return (
    <Badge
      text={`${flag} ${region}`}
      variant="secondary"
      size="sm"
    />
  );
}

// Premium badge - gold to terracotta gradient
export function PremiumBadge() {
  return (
    <Badge
      text="Premium"
      variant="premium"
      size="sm"
      icon={
        <Text style={styles.premiumIcon}>✦</Text>
      }
    />
  );
}

// Accent badge - gold for special highlights
export function AccentBadge({ text }: { text: string }) {
  return (
    <Badge
      text={text}
      variant="accent"
      size="sm"
    />
  );
}

// Time badge - editorial style with warm undertone
export function TimeBadge({ time, icon }: { time: string; icon?: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.timeBadge, { backgroundColor: isDark ? 'rgba(250, 248, 245, 0.08)' : 'rgba(45, 36, 32, 0.05)' }]}>
      {icon}
      <Text style={[styles.timeText, { color: colors.muted }]}>{time}</Text>
    </View>
  );
}

// Outlined badge variant - for subtle labeling
export function OutlinedBadge({
  text,
  color,
  size = 'sm',
}: {
  text: string;
  color?: string;
  size?: BadgeSize;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const borderColor = color || colors.border;
  const textColor = color || colors.muted;
  const sizeConfig = sizeStyles[size];

  return (
    <View
      style={[
        styles.outlinedBadge,
        {
          borderColor,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
        },
      ]}
    >
      <Text
        style={[
          styles.outlinedText,
          {
            color: textColor,
            fontSize: sizeConfig.fontSize,
            letterSpacing: sizeConfig.letterSpacing,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    borderWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderRightColor: 'rgba(0, 0, 0, 0.05)',
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  icon: {
    marginRight: 5,
  },
  premiumIcon: {
    fontSize: 9,
    color: '#ffffff',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
    letterSpacing: 0.3,
  },
  outlinedBadge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  outlinedText: {
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
