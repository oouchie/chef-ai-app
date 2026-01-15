// Haptic feedback utilities for mobile devices

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 30,
  heavy: 50,
  success: 50,
  warning: [30, 30, 30],
  error: [50, 50, 50],
};

export function haptic(type: HapticType = 'light'): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const pattern = patterns[type];
    navigator.vibrate(pattern);
  }
}

// Convenience functions
export const hapticLight = () => haptic('light');
export const hapticMedium = () => haptic('medium');
export const hapticHeavy = () => haptic('heavy');
export const hapticSuccess = () => haptic('success');
export const hapticWarning = () => haptic('warning');
export const hapticError = () => haptic('error');
