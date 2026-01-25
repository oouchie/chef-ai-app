import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Shadows } from '@/theme';
import { WorldRegion, WORLD_REGIONS } from '@/types';
import { hapticLight, hapticSelection } from '@/lib/haptics';

interface HeaderProps {
  onMenuPress: () => void;
  onNewChat: () => void;
  selectedRegion: WorldRegion | 'all';
  onRegionChange: (region: WorldRegion | 'all') => void;
  onToolsPress: () => void;
  onMealPlannerPress: () => void;
  onRestaurantPress: () => void;
}

export default function Header({
  onMenuPress,
  onNewChat,
  selectedRegion,
  onRegionChange,
  onToolsPress,
  onMealPlannerPress,
  onRestaurantPress,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const selectedRegionInfo =
    selectedRegion === 'all'
      ? { name: 'All Cuisines', flag: '🌎' }
      : WORLD_REGIONS.find((r) => r.id === selectedRegion);

  // Animation for new chat button
  const newChatScale = useSharedValue(1);
  const newChatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: newChatScale.value }],
  }));

  const handleNewChatPress = useCallback(() => {
    hapticLight();
    newChatScale.value = withSpring(0.9, { damping: 15 });
    setTimeout(() => {
      newChatScale.value = withSpring(1, { damping: 15 });
    }, 100);
    onNewChat();
  }, [onNewChat]);

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        {/* Warm glass background */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Warm cream overlay for editorial feel */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? 'rgba(26, 22, 20, 0.85)'
                : 'rgba(250, 248, 245, 0.85)'
            }
          ]}
        />

        <View style={styles.header}>
          {/* Left: Subtle menu icon */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              hapticLight();
              onMenuPress();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather
              name="menu"
              size={22}
              color={colors.muted}
            />
          </TouchableOpacity>

          {/* Center: Logo with elegant typography */}
          <View style={styles.centerContainer}>
            <Text style={[styles.logoText, { color: colors.foreground }]}>
              RecipePilot
            </Text>
          </View>

          {/* Right: Tools + New Chat */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => {
                hapticLight();
                onToolsPress();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="sliders" size={18} color={colors.muted} />
            </TouchableOpacity>

            <Animated.View style={newChatAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.newChatButton,
                  { backgroundColor: colors.primary },
                  Shadows.glowPrimary,
                ]}
                onPress={handleNewChatPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="plus" size={18} color="#ffffff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Subtle bottom border */}
        <View
          style={[
            styles.headerBorder,
            { backgroundColor: colors.border }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  headerWrapper: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  newChatButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
});
