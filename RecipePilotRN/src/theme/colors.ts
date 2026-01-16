import { Appearance } from 'react-native';

export const Colors = {
  light: {
    background: '#faf7f2',
    foreground: '#1a1a1a',
    primary: '#ff6b35',
    primaryDark: '#e85d04',
    secondary: '#4ecdc4',
    accent: '#f7931e',
    card: '#ffffff',
    border: '#e5e5e5',
    muted: '#6b7280',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    // Glassmorphism
    glassBackground: 'rgba(255, 255, 255, 0.75)',
    glassBackgroundStrong: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    primary: '#ff8c5a',
    primaryDark: '#ff6b35',
    secondary: '#5eead4',
    accent: '#fbbf24',
    card: '#141414',
    border: '#2a2a2a',
    muted: '#a1a1aa',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    // Glassmorphism
    glassBackground: 'rgba(20, 20, 20, 0.8)',
    glassBackgroundStrong: 'rgba(30, 30, 30, 0.95)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export type ThemeColors = typeof Colors.light;

export function getColors(colorScheme: 'light' | 'dark' | null | undefined): ThemeColors {
  return colorScheme === 'dark' ? Colors.dark : Colors.light;
}

export function useThemeColors(): ThemeColors {
  const colorScheme = Appearance.getColorScheme();
  return getColors(colorScheme);
}
