// Gradient color arrays for expo-linear-gradient
// Culinary Editorial Theme - warm, appetizing, sophisticated

export const Gradients = {
  // Terracotta primary - warm and appetizing
  primary: ['#c45d3a', '#d4735a'] as const,
  primaryLight: ['#d4735a', '#e08a70'] as const,
  primaryDark: ['#a84d2e', '#c45d3a'] as const,

  // Sage green secondary - fresh, natural
  secondary: ['#7d9a78', '#9ab896'] as const,
  secondaryLight: ['#9ab896', '#b5d0b0'] as const,

  // Warm gold accent - premium editorial feel
  accent: ['#d4a574', '#e8c9a8'] as const,
  accentLight: ['#e8c9a8', '#f0dcc4'] as const,

  // Premium gradient - gold to terracotta for special elements
  premium: ['#d4a574', '#c45d3a'] as const,
  premiumReverse: ['#c45d3a', '#d4a574'] as const,

  // Warm cream gradient for backgrounds
  warm: ['#faf8f5', '#f5f2ed'] as const,
  warmDark: ['#1a1614', '#252220'] as const,

  // Editorial card gradient - subtle warmth
  editorial: ['#ffffff', '#faf8f5'] as const,
  editorialDark: ['#302c28', '#252220'] as const,

  // Success/warning using palette
  success: ['#7d9a78', '#9ab896'] as const,
  warning: ['#d4a574', '#e8c9a8'] as const,
  error: ['#c45d3a', '#d4735a'] as const,

  // Difficulty badges - culinary themed
  easy: ['#7d9a78', '#9ab896'] as const,
  medium: ['#d4a574', '#e8c9a8'] as const,
  hard: ['#c45d3a', '#d4735a'] as const,

  // Message bubbles - terracotta for user messages
  userMessage: ['#c45d3a', '#d4735a'] as const,
  userMessageDark: ['#d4735a', '#e08a70'] as const,

  // Shimmer effect - warm tinted
  shimmer: ['transparent', 'rgba(250, 248, 245, 0.4)', 'transparent'] as const,
  shimmerDark: ['transparent', 'rgba(212, 165, 116, 0.15)', 'transparent'] as const,

  // Hero/feature gradients
  hero: ['#c45d3a', '#d4a574'] as const,
  heroDark: ['#d4735a', '#e8c9a8'] as const,

  // Overlay gradients for images
  imageOverlay: ['transparent', 'rgba(26, 22, 20, 0.6)'] as const,
  imageOverlayStrong: ['rgba(26, 22, 20, 0.3)', 'rgba(26, 22, 20, 0.85)'] as const,

  // Legacy alias for compatibility
  rose: ['#c45d3a', '#d4735a'] as const,
};

export type GradientKey = keyof typeof Gradients;
