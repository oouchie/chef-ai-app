import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// Map haptic types to expo-haptics
const hapticMap: Record<HapticType, () => void> = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

export function haptic(type: HapticType = 'light'): void {
  // Only trigger haptics on native platforms
  if (Platform.OS === 'web') return;

  try {
    hapticMap[type]();
  } catch (error) {
    // Silently fail if haptics not available
    console.log('Haptic feedback not available:', error);
  }
}

// Convenience functions
export const hapticLight = () => haptic('light');
export const hapticMedium = () => haptic('medium');
export const hapticHeavy = () => haptic('heavy');
export const hapticSuccess = () => haptic('success');
export const hapticWarning = () => haptic('warning');
export const hapticError = () => haptic('error');

// Selection feedback (for scrolling through lists, pickers, etc.)
export const hapticSelection = () => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.selectionAsync();
  } catch (error) {
    console.log('Selection haptic not available:', error);
  }
};
