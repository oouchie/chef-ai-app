import { Appearance } from 'react-native';

export const Colors = {
  light: {
    // Clean iOS-style backgrounds
    background: '#f8fafc',
    foreground: '#0f172a',
    // Blue primary matching logo
    primary: '#1a3a8f',
    primaryLight: '#3b5dc9',
    primaryDark: '#132c6b',
    // Warm accent for food elements
    secondary: '#f97316',
    accent: '#ef4444',
    // Native iOS card style
    card: '#ffffff',
    border: '#e2e8f0',
    muted: '#64748b',
    // Semantic colors
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    // Glassmorphism - subtle for native feel
    glassBackground: 'rgba(255, 255, 255, 0.85)',
    glassBackgroundStrong: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    // Dark iOS-style backgrounds
    background: '#0f172a',
    foreground: '#f8fafc',
    // Brighter blue for dark mode
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#1a3a8f',
    // Warm accent
    secondary: '#fb923c',
    accent: '#f87171',
    // Native iOS dark card
    card: '#1e293b',
    border: '#334155',
    muted: '#94a3b8',
    // Semantic colors
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
    // Glassmorphism - richer for dark mode
    glassBackground: 'rgba(15, 23, 42, 0.85)',
    glassBackgroundStrong: 'rgba(30, 41, 59, 0.95)',
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
