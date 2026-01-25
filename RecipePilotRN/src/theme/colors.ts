import { Appearance } from 'react-native';

// Culinary Editorial Theme
// Sophisticated, magazine-quality, warm and appetizing

export const Colors = {
  light: {
    // Warm cream backgrounds - editorial warmth
    background: '#faf8f5',
    foreground: '#2d2420',

    // Card surfaces
    card: '#ffffff',
    cardAlt: '#f5f2ed',
    cardElevated: '#fffdfb',

    // Deep terracotta primary - appetizing, warm
    primary: '#c45d3a',
    primaryLight: '#d4735a',
    primaryDark: '#a84d2e',

    // Sage green secondary - fresh, natural
    secondary: '#7d9a78',
    secondaryLight: '#9ab896',

    // Warm gold accent - premium feel
    accent: '#d4a574',
    accentLight: '#e8c9a8',

    // Warm gray muted tones
    muted: '#8a7f76',
    mutedLight: '#b8ada3',

    // Subtle warm border
    border: '#e8e2da',
    borderLight: '#f0ebe4',

    // Semantic colors - using palette colors
    success: '#7d9a78',
    error: '#c45d3a',
    warning: '#d4a574',

    // Glassmorphism - warm cream tones
    glassBackground: 'rgba(250, 248, 245, 0.85)',
    glassBackgroundStrong: 'rgba(250, 248, 245, 0.95)',
    glassBorder: 'rgba(200, 190, 180, 0.3)',

    // Message bubbles
    userBubble: '#c45d3a',
    assistantBubble: '#ffffff',

    // Input area
    inputBackground: 'rgba(250, 248, 245, 0.95)',
  },
  dark: {
    // Deep espresso backgrounds - rich, luxurious
    background: '#1a1614',
    foreground: '#f5f2ed',

    // Dark brown card surfaces
    card: '#252220',
    cardAlt: '#302c28',
    cardElevated: '#2d2a26',

    // Lighter terracotta for dark mode visibility
    primary: '#d4735a',
    primaryLight: '#e08a70',
    primaryDark: '#c45d3a',

    // Lighter sage for dark mode
    secondary: '#9ab896',
    secondaryLight: '#b5d0b0',

    // Lighter gold accent
    accent: '#e8c9a8',
    accentLight: '#f0dcc4',

    // Warm muted tones for dark
    muted: '#6b615a',
    mutedLight: '#8a7f76',

    // Subtle dark border
    border: '#3d3835',
    borderLight: '#4a4540',

    // Semantic colors - lighter for dark mode
    success: '#9ab896',
    error: '#d4735a',
    warning: '#e8c9a8',

    // Glassmorphism - deep espresso tones
    glassBackground: 'rgba(26, 22, 20, 0.85)',
    glassBackgroundStrong: 'rgba(37, 34, 32, 0.95)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',

    // Message bubbles
    userBubble: '#c45d3a',
    assistantBubble: '#252220',

    // Input area
    inputBackground: 'rgba(37, 34, 32, 0.95)',
  },
};

// Editorial specific colors (not theme-dependent)
export const EditorialColors = {
  // Core palette
  terracotta: '#c45d3a',
  terracottaLight: '#d4735a',
  terracottaDark: '#a84d2e',
  sage: '#7d9a78',
  sageLight: '#9ab896',
  gold: '#d4a574',
  goldLight: '#e8c9a8',
  cream: '#faf8f5',
  creamAlt: '#f5f2ed',
  espresso: '#1a1614',
  espressoLight: '#252220',

  // Difficulty badge colors
  easy: {
    background: '#7d9a78',
    backgroundLight: '#9ab896',
  },
  medium: {
    background: '#d4a574',
    backgroundLight: '#e8c9a8',
  },
  hard: {
    background: '#c45d3a',
    backgroundLight: '#d4735a',
  },

  // Glass warm tints
  glassWarmLight: 'rgba(250, 248, 245, 0.92)',
  glassWarmDark: 'rgba(26, 22, 20, 0.92)',
  glassBorderWarmLight: 'rgba(212, 165, 116, 0.2)',
  glassBorderWarmDark: 'rgba(212, 165, 116, 0.1)',
};

export type ThemeColors = typeof Colors.light;

export function getColors(colorScheme: 'light' | 'dark' | null | undefined): ThemeColors {
  return colorScheme === 'dark' ? Colors.dark : Colors.light;
}

export function useThemeColors(): ThemeColors {
  const colorScheme = Appearance.getColorScheme();
  return getColors(colorScheme);
}
