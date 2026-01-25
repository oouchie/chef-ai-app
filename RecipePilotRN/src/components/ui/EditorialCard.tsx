import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows, Gradients } from '@/theme';
import { Colors, EditorialColors } from '@/theme';
import { hapticLight } from '@/lib/haptics';

type CardVariant = 'default' | 'featured' | 'compact' | 'horizontal';

interface EditorialCardProps {
  // Content
  title: string;
  subtitle?: string;
  metadata?: string;

  // Image
  imageSource?: ImageSourcePropType;
  imageUri?: string;
  imagePlaceholder?: boolean;

  // Styling
  variant?: CardVariant;
  style?: ViewStyle;
  titleStyle?: TextStyle;

  // Interaction
  onPress?: () => void;
  disabled?: boolean;

  // Optional elements
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function EditorialCard({
  title,
  subtitle,
  metadata,
  imageSource,
  imageUri,
  imagePlaceholder = false,
  variant = 'default',
  style,
  titleStyle,
  onPress,
  disabled = false,
  badge,
  footer,
  children,
}: EditorialCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedShadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      shadowOpacity.value,
      [0, 1],
      [0.6, 1],
      Extrapolation.CLAMP
    ),
  }));

  const handlePressIn = useCallback(() => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
      shadowOpacity.value = withTiming(0, { duration: 100 });
      hapticLight();
    }
  }, [onPress, disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    shadowOpacity.value = withTiming(1, { duration: 150 });
  }, []);

  const handlePress = useCallback(() => {
    if (onPress && !disabled) {
      onPress();
    }
  }, [onPress, disabled]);

  // Variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          container: styles.featuredContainer,
          imageHeight: 220,
          titleSize: 22,
          titleWeight: '700' as const,
          borderRadius: 18,
        };
      case 'compact':
        return {
          container: styles.compactContainer,
          imageHeight: 120,
          titleSize: 15,
          titleWeight: '600' as const,
          borderRadius: 12,
        };
      case 'horizontal':
        return {
          container: styles.horizontalContainer,
          imageHeight: 100,
          titleSize: 16,
          titleWeight: '600' as const,
          borderRadius: 14,
        };
      default:
        return {
          container: styles.defaultContainer,
          imageHeight: 160,
          titleSize: 18,
          titleWeight: '600' as const,
          borderRadius: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Determine if we should show image
  const hasImage = imageSource || imageUri || imagePlaceholder;

  // Card content
  const cardContent = (
    <>
      {/* Image Area */}
      {hasImage && variant !== 'horizontal' && (
        <View style={[styles.imageContainer, { height: variantStyles.imageHeight }]}>
          {imageSource || imageUri ? (
            <Image
              source={imageSource || { uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? colors.card : colors.cardAlt }]}>
              <LinearGradient
                colors={isDark ? Gradients.warmDark : Gradients.warm}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}

          {/* Image overlay gradient */}
          <LinearGradient
            colors={Gradients.imageOverlay}
            style={styles.imageOverlay}
          />

          {/* Badge positioned on image */}
          {badge && (
            <View style={styles.badgeContainer}>
              {badge}
            </View>
          )}
        </View>
      )}

      {/* Horizontal variant layout */}
      {variant === 'horizontal' && (
        <View style={styles.horizontalLayout}>
          {hasImage && (
            <View style={[styles.horizontalImageContainer, { height: variantStyles.imageHeight, width: variantStyles.imageHeight }]}>
              {imageSource || imageUri ? (
                <Image
                  source={imageSource || { uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? colors.card : colors.cardAlt }]}>
                  <LinearGradient
                    colors={isDark ? Gradients.warmDark : Gradients.warm}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.horizontalContent}>
            {badge && !hasImage && (
              <View style={styles.inlineBadge}>
                {badge}
              </View>
            )}

            <Text
              style={[
                styles.title,
                {
                  fontSize: variantStyles.titleSize,
                  fontWeight: variantStyles.titleWeight,
                  color: colors.foreground,
                },
                titleStyle,
              ]}
              numberOfLines={2}
            >
              {title}
            </Text>

            {subtitle && (
              <Text
                style={[styles.subtitle, { color: colors.muted }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}

            {metadata && (
              <Text style={[styles.metadata, { color: colors.mutedLight }]}>
                {metadata}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Standard content area (non-horizontal) */}
      {variant !== 'horizontal' && (
        <View style={styles.contentContainer}>
          {badge && !hasImage && (
            <View style={styles.inlineBadge}>
              {badge}
            </View>
          )}

          {/* Title with elegant typography */}
          <Text
            style={[
              styles.title,
              {
                fontSize: variantStyles.titleSize,
                fontWeight: variantStyles.titleWeight,
                color: colors.foreground,
              },
              variant === 'featured' && styles.featuredTitle,
              titleStyle,
            ]}
            numberOfLines={variant === 'compact' ? 2 : 3}
          >
            {title}
          </Text>

          {/* Subtitle */}
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: colors.muted }]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}

          {/* Metadata row */}
          {metadata && (
            <Text style={[styles.metadata, { color: colors.mutedLight }]}>
              {metadata}
            </Text>
          )}

          {/* Optional children */}
          {children}

          {/* Footer area */}
          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      )}
    </>
  );

  // Wrap in touchable if onPress is provided
  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          animatedStyle,
          styles.cardBase,
          variantStyles.container,
          {
            backgroundColor: colors.card,
            borderRadius: variantStyles.borderRadius,
            borderColor: colors.border,
          },
          variant === 'featured' ? Shadows.editorialCard : Shadows.card,
          disabled && styles.disabled,
          style,
        ]}
      >
        {cardContent}
      </AnimatedTouchable>
    );
  }

  // Non-interactive card
  return (
    <Animated.View
      style={[
        styles.cardBase,
        variantStyles.container,
        {
          backgroundColor: colors.card,
          borderRadius: variantStyles.borderRadius,
          borderColor: colors.border,
        },
        variant === 'featured' ? Shadows.editorialCard : Shadows.card,
        style,
      ]}
    >
      {cardContent}
    </Animated.View>
  );
}

// Featured card variant export
export function FeaturedCard(props: Omit<EditorialCardProps, 'variant'>) {
  return <EditorialCard {...props} variant="featured" />;
}

// Compact card variant export
export function CompactCard(props: Omit<EditorialCardProps, 'variant'>) {
  return <EditorialCard {...props} variant="compact" />;
}

// Horizontal card variant export
export function HorizontalCard(props: Omit<EditorialCardProps, 'variant'>) {
  return <EditorialCard {...props} variant="horizontal" />;
}

const styles = StyleSheet.create({
  cardBase: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  defaultContainer: {
    width: '100%',
  },
  featuredContainer: {
    width: '100%',
  },
  compactContainer: {
    width: 160,
  },
  horizontalContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  horizontalImageContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: '50%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  contentContainer: {
    padding: 16,
  },
  horizontalLayout: {
    flexDirection: 'row',
    flex: 1,
  },
  horizontalContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  inlineBadge: {
    marginBottom: 10,
  },
  title: {
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  featuredTitle: {
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    letterSpacing: 0.1,
  },
  metadata: {
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  disabled: {
    opacity: 0.5,
  },
});
