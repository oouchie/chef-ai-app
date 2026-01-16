import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors } from '@/theme';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey } from '@/lib/chat';
import { hapticSuccess, hapticWarning } from '@/lib/haptics';

import { GlassView, GlassInput, GradientButton, GlassButton } from '@/components/ui';

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

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  // Load stored API key
  useEffect(() => {
    const loadApiKey = async () => {
      const key = await getStoredApiKey();
      if (key) {
        setApiKey(key);
        setHasStoredKey(true);
      }
    };
    loadApiKey();
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      showToast('Please enter an API key', 'warning');
      return;
    }

    await setStoredApiKey(apiKey.trim());
    setHasStoredKey(true);
    hapticSuccess();
    showToast('API key saved successfully!', 'success');
  }, [apiKey, showToast]);

  const handleRemoveApiKey = useCallback(async () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your API key? You will switch to demo mode.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeStoredApiKey();
            setApiKey('');
            setHasStoredKey(false);
            hapticWarning();
            showToast('API key removed', 'info');
          },
        },
      ]
    );
  }, [showToast]);

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

        {/* API Key Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <SettingsSection title="AI CONFIGURATION">
            <View style={styles.apiKeySection}>
              <Text style={[styles.apiKeyLabel, { color: colors.foreground }]}>
                Anthropic API Key
              </Text>
              <Text style={[styles.apiKeyHint, { color: colors.muted }]}>
                Get your key from console.anthropic.com
              </Text>

              <GlassInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-ant-..."
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.apiKeyInput}
                rightIcon={
                  <Feather
                    name={showApiKey ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.muted}
                  />
                }
                onRightIconPress={() => setShowApiKey(!showApiKey)}
              />

              <View style={styles.apiKeyButtons}>
                <GradientButton
                  title={hasStoredKey ? 'Update Key' : 'Save Key'}
                  onPress={handleSaveApiKey}
                  size="sm"
                  style={{ flex: 1 }}
                />
                {hasStoredKey && (
                  <GlassButton
                    title="Remove"
                    onPress={handleRemoveApiKey}
                    size="sm"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </View>

              {hasStoredKey && (
                <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                  <Feather name="check-circle" size={14} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>
                    API key configured
                  </Text>
                </View>
              )}
            </View>
          </SettingsSection>
        </Animated.View>

        {/* App Info Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
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
              onPress={() => handleOpenLink('https://recipepilot.app/privacy')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
              icon="file-text"
              title="Terms of Service"
              onPress={() => handleOpenLink('https://recipepilot.app/terms')}
            />
          </SettingsSection>
        </Animated.View>

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
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
        <Animated.View entering={FadeInDown.delay(400).duration(300)}>
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
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Made with love by RecipePilot
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
  apiKeySection: {
    padding: 16,
  },
  apiKeyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  apiKeyHint: {
    fontSize: 13,
    marginBottom: 16,
  },
  apiKeyInput: {
    marginBottom: 12,
  },
  apiKeyButtons: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
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
    paddingTop: 20,
  },
  footerText: {
    fontSize: 13,
  },
});
