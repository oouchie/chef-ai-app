// Gradient color arrays for expo-linear-gradient
export const Gradients = {
  primary: ['#ff6b35', '#f7931e'] as const,
  secondary: ['#4ecdc4', '#44a08d'] as const,
  premium: ['#667eea', '#764ba2'] as const,
  rose: ['#f43f5e', '#ec4899'] as const,
  success: ['#10b981', '#059669'] as const,
  warning: ['#fbbf24', '#f59e0b'] as const,

  // Difficulty badges
  easy: ['#10b981', '#059669'] as const,
  medium: ['#fbbf24', '#f59e0b'] as const,
  hard: ['#f43f5e', '#dc2626'] as const,

  // Message bubbles
  userMessage: ['#ff6b35', '#f7931e'] as const,

  // Shimmer effect
  shimmer: ['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent'] as const,
};

export type GradientKey = keyof typeof Gradients;
