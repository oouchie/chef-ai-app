import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import { Colors } from '@/theme';
import { WorldRegion, WORLD_REGIONS } from '@/types';
import { hapticLight, hapticSelection } from '@/lib/haptics';
import { GlassIconButton } from '@/components/ui/GlassButton';

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

  const [showRegions, setShowRegions] = useState(false);

  const handleRegionSelect = useCallback(
    (region: WorldRegion | 'all') => {
      hapticSelection();
      onRegionChange(region);
    },
    [onRegionChange]
  );

  const toggleRegions = useCallback(() => {
    hapticLight();
    setShowRegions((prev) => !prev);
  }, []);

  const selectedRegionInfo =
    selectedRegion === 'all'
      ? { name: 'All Cuisines', flag: '🌎' }
      : WORLD_REGIONS.find((r) => r.id === selectedRegion);

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[
            styles.header,
            {
              backgroundColor: Platform.OS === 'android' ? colors.card : 'transparent',
            },
          ]}
        >
          {/* Left: Menu Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="menu" size={24} color={colors.foreground} />
          </TouchableOpacity>

          {/* Center: Logo and Region */}
          <TouchableOpacity style={styles.titleContainer} onPress={toggleRegions}>
            <View style={styles.logoRow}>
              <Text style={[styles.title, { color: colors.foreground }]}>RecipePilot</Text>
              <Feather
                name={showRegions ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.muted}
                style={styles.chevron}
              />
            </View>
            <View style={styles.regionBadge}>
              <Text style={styles.regionFlag}>{selectedRegionInfo?.flag}</Text>
              <Text style={[styles.regionName, { color: colors.muted }]}>
                {selectedRegionInfo?.name}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right: Action Buttons */}
          <View style={styles.rightButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onToolsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="tool" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNewChat}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="edit" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Region Chips */}
      {showRegions && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.regionChipsWrapper,
            {
              backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card,
            },
          ]}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={40}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.regionChipsContent}
          >
            {/* All Regions */}
            <TouchableOpacity
              style={[
                styles.regionChip,
                selectedRegion === 'all' && styles.regionChipActive,
                {
                  backgroundColor:
                    selectedRegion === 'all' ? colors.primary : colors.card,
                  borderColor: selectedRegion === 'all' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleRegionSelect('all')}
            >
              <Text style={styles.regionChipFlag}>🌎</Text>
              <Text
                style={[
                  styles.regionChipText,
                  { color: selectedRegion === 'all' ? 'white' : colors.foreground },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Region Chips */}
            {WORLD_REGIONS.map((region, index) => (
              <Animated.View
                key={region.id}
                entering={FadeInRight.delay(index * 30).duration(200)}
              >
                <TouchableOpacity
                  style={[
                    styles.regionChip,
                    selectedRegion === region.id && styles.regionChipActive,
                    {
                      backgroundColor:
                        selectedRegion === region.id ? colors.primary : colors.card,
                      borderColor:
                        selectedRegion === region.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleRegionSelect(region.id)}
                >
                  <Text style={styles.regionChipFlag}>{region.flag}</Text>
                  <Text
                    style={[
                      styles.regionChipText,
                      {
                        color:
                          selectedRegion === region.id ? 'white' : colors.foreground,
                      },
                    ]}
                  >
                    {region.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Quick Action Buttons */}
          <View style={[styles.quickActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={onMealPlannerPress}
            >
              <Feather name="calendar" size={18} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.foreground }]}>
                Meal Plan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={onRestaurantPress}
            >
              <Feather name="coffee" size={18} color={colors.secondary} />
              <Text style={[styles.quickActionText, { color: colors.foreground }]}>
                Restaurants
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
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
  },
  iconButton: {
    padding: 8,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 4,
  },
  regionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  regionFlag: {
    fontSize: 14,
  },
  regionName: {
    fontSize: 12,
    marginLeft: 4,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  regionChipsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  regionChipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  regionChipActive: {
    elevation: 2,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  regionChipFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  regionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
