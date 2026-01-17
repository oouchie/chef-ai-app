// Gradient color arrays for expo-linear-gradient
export const Gradients = {
  // Blue primary matching logo
  primary: ['#1a3a8f', '#3b5dc9'] as const,
  primaryLight: ['#3b82f6', '#60a5fa'] as const,
  // Warm orange for food/accent
  secondary: ['#f97316', '#fb923c'] as const,
  // Premium purple
  premium: ['#7c3aed', '#a855f7'] as const,
  // Red accent
  rose: ['#ef4444', '#f87171'] as const,
  success: ['#22c55e', '#4ade80'] as const,
  warning: ['#f59e0b', '#fbbf24'] as const,

  // Difficulty badges
  easy: ['#22c55e', '#4ade80'] as const,
  medium: ['#f59e0b', '#fbbf24'] as const,
  hard: ['#ef4444', '#f87171'] as const,

  // Message bubbles - blue for user
  userMessage: ['#1a3a8f', '#3b5dc9'] as const,

  // Shimmer effect
  shimmer: ['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent'] as const,
};

export type GradientKey = keyof typeof Gradients;
