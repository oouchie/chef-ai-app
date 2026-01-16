import {
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  WithTimingConfig,
  WithSpringConfig,
} from 'react-native-reanimated';

// Timing configurations
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

  // Slide up animation
  slideUp: (value: SharedValue<number>, from: number = 20) => {
    'worklet';
    value.value = from;
    value.value = withSpring(0, SpringConfigs.gentle);
  },

  // Scale in animation (for modals)
  scaleIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = 0.95;
    value.value = withSpring(1, SpringConfigs.bouncy);
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

  // Press scale (for touch feedback)
  pressIn: (value: SharedValue<number>) => {
    'worklet';
    value.value = withTiming(0.97, TimingConfigs.fast);
  },

  pressOut: (value: SharedValue<number>) => {
    'worklet';
    value.value = withSpring(1, SpringConfigs.bouncy);
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
