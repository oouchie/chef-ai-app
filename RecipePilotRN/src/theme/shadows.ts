import { Platform, ViewStyle } from 'react-native';

// Shadow presets for React Native
// Note: Android uses elevation, iOS uses shadow properties

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  } as ViewStyle,

  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,

  // Glass shadows
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  } as ViewStyle,

  glassCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  } as ViewStyle,

  // Glow effects (iOS only, Android uses elevation)
  glowPrimary: Platform.select({
    ios: {
      shadowColor: '#1a3a8f',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,

  glowSecondary: Platform.select({
    ios: {
      shadowColor: '#f97316',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,

  glowRose: Platform.select({
    ios: {
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,
};

export type ShadowKey = keyof typeof Shadows;
