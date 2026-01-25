import { Platform, ViewStyle } from 'react-native';

// Shadow presets for React Native
// Culinary Editorial Theme - soft, sophisticated shadows
// Note: Android uses elevation, iOS uses shadow properties

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  // Standard shadows - warm tinted
  sm: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  md: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  lg: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  } as ViewStyle,

  xl: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,

  // Card shadows - refined, warm
  card: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,

  cardHover: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,

  cardElevated: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,

  // Editorial shadows - larger blur, lower opacity for magazine feel
  editorial: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 6,
  } as ViewStyle,

  editorialCard: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 4,
  } as ViewStyle,

  editorialHover: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  } as ViewStyle,

  // Glass shadows - soft and subtle
  glass: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 4,
  } as ViewStyle,

  glassCard: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
  } as ViewStyle,

  // Glow effects - terracotta, sage, and gold (iOS only, Android uses elevation)
  glowPrimary: Platform.select({
    ios: {
      shadowColor: '#c45d3a',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,

  glowPrimarySubtle: Platform.select({
    ios: {
      shadowColor: '#c45d3a',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    default: {
      elevation: 4,
    },
  }) as ViewStyle,

  glowSecondary: Platform.select({
    ios: {
      shadowColor: '#7d9a78',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,

  glowSecondarySubtle: Platform.select({
    ios: {
      shadowColor: '#7d9a78',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
    },
    default: {
      elevation: 4,
    },
  }) as ViewStyle,

  glowAccent: Platform.select({
    ios: {
      shadowColor: '#d4a574',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,

  glowAccentSubtle: Platform.select({
    ios: {
      shadowColor: '#d4a574',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    default: {
      elevation: 4,
    },
  }) as ViewStyle,

  // Warm glow for images/cards
  glowWarm: Platform.select({
    ios: {
      shadowColor: '#d4a574',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
    },
    default: {
      elevation: 5,
    },
  }) as ViewStyle,

  // Legacy alias for compatibility
  glowRose: Platform.select({
    ios: {
      shadowColor: '#c45d3a',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    default: {
      elevation: 6,
    },
  }) as ViewStyle,

  // Button shadows - refined, subtle
  button: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle,

  buttonPressed: {
    shadowColor: '#2d2420',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  } as ViewStyle,

  // Inner shadow effect (simulated with border for RN)
  innerLight: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,

  innerDark: {
    borderWidth: 1,
    borderColor: 'rgba(45, 36, 32, 0.05)',
  } as ViewStyle,
};

export type ShadowKey = keyof typeof Shadows;
