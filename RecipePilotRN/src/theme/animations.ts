import {
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  WithTimingConfig,
  WithSpringConfig,
} from 'react-native-reanimated';

// Timing configurations - Culinary Editorial feel
export const TimingConfigs = {
  fast: {
    duration: 200,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  normal: {
    duration: 300,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  slow: {
    duration: 500,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  // For slide animations
  slide: {
    duration: 400,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  } as WithTimingConfig,

  // Editorial reveal - smooth and sophisticated
  editorial: {
    duration: 400,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } as WithTimingConfig,

  // Elegant entrance
  elegant: {
    duration: 500,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  } as WithTimingConfig,

  // Fade in up - magazine style reveal
  fadeInUp: {
    duration: 400,
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  } as WithTimingConfig,
};

// Spring configurations
export const SpringConfigs = {
  gentle: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  } as WithSpringConfig,

  bouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  } as WithSpringConfig,

  stiff: {
    damping: 30,
    stiffness: 400,
    mass: 1,
  } as WithSpringConfig,

  // Smooth editorial spring
  editorial: {
    damping: 25,
    stiffness: 150,
    mass: 1,
  } as WithSpringConfig,

  // Soft landing
  soft: {
    damping: 18,
    stiffness: 120,
    mass: 1.2,
  } as WithSpringConfig,
};

// Animation factories
export const Animations = {
  // Fade in animation
  fadeIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = withTiming(1, TimingConfigs.normal);
  },

  // Fade out animation
  fadeOut: (value: SharedValue<number>) => {
    'worklet';
    value.value = withTiming(0, TimingConfigs.fast);
  },

  // Editorial fade in - smooth and elegant
  editorialFadeIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = withTiming(1, TimingConfigs.editorial);
  },

  // Fade in up - magazine style reveal
  fadeInUp: (translateY: SharedValue<number>, opacity: SharedValue<number>, distance: number = 20) => {
    'worklet';
    translateY.value = distance;
    opacity.value = 0;
    translateY.value = withTiming(0, TimingConfigs.fadeInUp);
    opacity.value = withTiming(1, TimingConfigs.fadeInUp);
  },

  // Slide up animation
  slideUp: (value: SharedValue<number>, from: number = 20) => {
    'worklet';
    value.value = from;
    value.value = withSpring(0, SpringConfigs.gentle);
  },

  // Editorial slide up
  editorialSlideUp: (value: SharedValue<number>, from: number = 30) => {
    'worklet';
    value.value = from;
    value.value = withSpring(0, SpringConfigs.editorial);
  },

  // Scale in animation (for modals)
  scaleIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = 0.95;
    value.value = withSpring(1, SpringConfigs.bouncy);
  },

  // Editorial scale in - more subtle
  editorialScaleIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = 0.97;
    value.value = withSpring(1, SpringConfigs.editorial);
  },

  // Float animation (continuous)
  float: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite
      true // Reverse
    );
  },

  // Gentle float - slower, more subtle for editorial feel
  gentleFloat: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },

  // Pulse animation (continuous)
  pulse: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },

  // Gentle pulse - more subtle
  gentlePulse: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },

  // Bounce animation (for buttons)
  bounce: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },

  // Glow pulse animation
  glowPulse: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },

  // Warm glow pulse - for food imagery
  warmGlowPulse: (value: SharedValue<number>) => {
    'worklet';
    value.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },

  // Press scale (for touch feedback)
  pressIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = withTiming(0.97, TimingConfigs.fast);
  },

  pressOut: (value: SharedValue<number>) => {
    'worklet';
    value.value = withSpring(1, SpringConfigs.bouncy);
  },

  // Gentle press for editorial buttons
  editorialPressIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = withTiming(0.98, TimingConfigs.fast);
  },

  editorialPressOut: (value: SharedValue<number>) => {
    'worklet';
    value.value = withSpring(1, SpringConfigs.editorial);
  },
};

// Stagger helper for list animations
export const StaggerHelpers = {
  // Calculate delay for staggered animations
  getStaggerDelay: (index: number, baseDelay: number = 50): number => {
    return index * baseDelay;
  },

  // Create staggered fade in up for list items
  staggeredFadeInUp: (
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
    index: number,
    baseDelay: number = 50,
    distance: number = 20
  ) => {
    'worklet';
    const delay = index * baseDelay;
    translateY.value = distance;
    opacity.value = 0;
    translateY.value = withDelay(delay, withTiming(0, TimingConfigs.fadeInUp));
    opacity.value = withDelay(delay, withTiming(1, TimingConfigs.fadeInUp));
  },

  // Create staggered scale in for grid items
  staggeredScaleIn: (
    scale: SharedValue<number>,
    opacity: SharedValue<number>,
    index: number,
    baseDelay: number = 60
  ) => {
    'worklet';
    const delay = index * baseDelay;
    scale.value = 0.9;
    opacity.value = 0;
    scale.value = withDelay(delay, withSpring(1, SpringConfigs.editorial));
    opacity.value = withDelay(delay, withTiming(1, TimingConfigs.editorial));
  },
};

// Animated style hooks
export function useFadeInStyle(progress: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
}

export function useSlideUpStyle(translateY: SharedValue<number>, opacity: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export function useScaleStyle(scale: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

export function useFloatStyle(translateY: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
}

// Editorial reveal style - combined fade, scale, and slide
export function useEditorialRevealStyle(
  opacity: SharedValue<number>,
  translateY: SharedValue<number>,
  scale: SharedValue<number>
) {
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
}

// Stagger list item style
export function useStaggerItemStyle(
  opacity: SharedValue<number>,
  translateY: SharedValue<number>
) {
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
