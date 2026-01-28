import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors } from '@/theme';
import { hapticSuccess } from '@/lib/haptics';

import { GlassView, GradientButton } from '@/components/ui';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title}</Text>
      <GlassView intensity="strong" style={styles.sectionContent}>
        {children}
      </GlassView>
    </View>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true,
}: SettingsRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const content = (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: (iconColor || colors.primary) + '20' }]}>
        <Feather name={icon} size={20} color={iconColor || colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement}
      {showArrow && onPress && (
        <Feather name="chevron-right" size={20} color={colors.muted} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { state } = useAppState();
  const { showToast } = useToast();

  const handleSubscribe = useCallback(() => {
    router.push('/(modals)/paywall');
  }, []);

  const handleOpenLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <GlassView
        intensity="strong"
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        borderRadius={0}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
      </GlassView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Section */}
        <Animated.View entering={FadeInDown.delay(0).duration(300)}>
          <SettingsSection title="SUBSCRIPTION">
            <SettingsRow
              icon="star"
              iconColor="#f7931e"
              title="RecipePilot Premium"
              subtitle="Unlock all features"
              onPress={handleSubscribe}
            />
          </SettingsSection>
        </Animated.View>

        {/* App Info Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <SettingsSection title="ABOUT">
            <SettingsRow
              icon="info"
              title="App Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon="book-open"
              title="Privacy Policy"
              onPress={() => handleOpenLink('https://1865freemoney.com/privacy')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon="file-text"
              title="Terms of Service"
              onPress={() => handleOpenLink('https://1865freemoney.com/terms')}
            />
          </SettingsSection>
        </Animated.View>

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <SettingsSection title="SUPPORT">
            <SettingsRow
              icon="mail"
              title="Contact Support"
              subtitle="help@recipepilot.app"
              onPress={() => handleOpenLink('mailto:help@recipepilot.app')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon="twitter"
              iconColor="#1DA1F2"
              title="Follow Us"
              subtitle="@recipepilot"
              onPress={() => handleOpenLink('https://twitter.com/recipepilot')}
            />
          </SettingsSection>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {state.sessions.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Chats</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {state.savedRecipes.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Recipes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {state.todos.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Tasks</Text>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => handleOpenLink('https://1865freemoney.com')}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerPowered, { color: colors.muted }]}>
              Powered by{' '}
              <Text style={[styles.footerBrand, { color: colors.primary }]}>
                1865 Free Money
              </Text>
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footerTagline, { color: colors.muted }]}>
            Digital Excellence. Atlanta, GA
          </Text>
          <Text style={[styles.footerCopyright, { color: colors.muted }]}>
            © {new Date().getFullYear()} RecipePilot. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  sectionContent: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    gap: 6,
  },
  footerPowered: {
    fontSize: 13,
  },
  footerBrand: {
    fontWeight: '600',
  },
  footerTagline: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  footerCopyright: {
    fontSize: 10,
    marginTop: 8,
  },
});
