import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/theme';
import { useToast } from '@/components/Toast';
import { hapticSuccess, hapticWarning } from '@/lib/haptics';
import {
  convertVolume,
  convertWeight,
  convertTemperature,
  formatTime,
  getSubstitutions,
} from '@/lib/cooking-helpers';
import { GlassView, GradientButton, GlassButton, GlassInput } from '@/components/ui';

type ToolTab = 'timer' | 'converter' | 'substitutions';

interface Timer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export default function ToolsModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ToolTab>('timer');

  // Timer state
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerMinutes, setNewTimerMinutes] = useState('');
  const [newTimerLabel, setNewTimerLabel] = useState('');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Converter state
  const [converterValue, setConverterValue] = useState('');
  const [converterResult, setConverterResult] = useState<string | null>(null);
  const [converterType, setConverterType] = useState<'volume' | 'weight' | 'temperature'>('volume');

  // Substitutions state
  const [searchIngredient, setSearchIngredient] = useState('');
  const [substitutions, setSubstitutions] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    const runningTimers = timers.filter((t) => t.isRunning);
    if (runningTimers.length > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimers((prev) =>
          prev.map((timer) => {
            if (timer.isRunning && timer.remainingSeconds > 0) {
              const newRemaining = timer.remainingSeconds - 1;
              if (newRemaining === 0) {
                handleTimerComplete(timer);
                return { ...timer, remainingSeconds: 0, isRunning: false };
              }
              return { ...timer, remainingSeconds: newRemaining };
            }
            return timer;
          })
        );
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timers.filter((t) => t.isRunning).length]);

  const handleTimerComplete = useCallback(async (timer: Timer) => {
    hapticSuccess();
    showToast(`Timer "${timer.label}" is done!`, 'success');

    // Play sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/timer.wav')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Could not play sound:', error);
    }

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Timer Complete!',
        body: `Your "${timer.label}" timer is done.`,
        sound: true,
      },
      trigger: null,
    });
  }, [showToast]);

  const addTimer = useCallback(() => {
    const minutes = parseInt(newTimerMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      showToast('Please enter a valid number of minutes', 'warning');
      return;
    }

    const timer: Timer = {
      id: Date.now().toString(),
      label: newTimerLabel || `Timer ${timers.length + 1}`,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
    };

    setTimers((prev) => [...prev, timer]);
    setNewTimerMinutes('');
    setNewTimerLabel('');
    hapticSuccess();
    showToast('Timer started!', 'success');
  }, [newTimerMinutes, newTimerLabel, timers.length, showToast]);

  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  }, []);

  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
    hapticWarning();
  }, []);

  // Converter functions
  const handleConvert = useCallback(() => {
    const value = parseFloat(converterValue);
    if (isNaN(value)) {
      showToast('Please enter a valid number', 'warning');
      return;
    }

    let result: string;
    if (converterType === 'volume') {
      const converted = convertVolume(value, 'cup', 'ml');
      result = `${value} cups = ${converted.formatted}`;
    } else if (converterType === 'weight') {
      const converted = convertWeight(value, 'oz', 'g');
      result = `${value} oz = ${converted.formatted}`;
    } else {
      const converted = convertTemperature(value, 'f', 'c');
      result = `${value}°F = ${converted.formatted}`;
    }

    setConverterResult(result);
    hapticSuccess();
  }, [converterValue, converterType, showToast]);

  // Substitutions function
  const handleSearchSubstitutions = useCallback(() => {
    if (!searchIngredient.trim()) {
      showToast('Please enter an ingredient', 'warning');
      return;
    }

    const subs = getSubstitutions(searchIngredient);
    setSubstitutions(subs);

    if (subs.length === 0) {
      showToast('No substitutions found for this ingredient', 'info');
    }
  }, [searchIngredient, showToast]);

  const tabs: { id: ToolTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: 'timer', label: 'Timers', icon: 'clock' },
    { id: 'converter', label: 'Converter', icon: 'repeat' },
    { id: 'substitutions', label: 'Substitutes', icon: 'refresh-cw' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <GlassView
        intensity="strong"
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        borderRadius={0}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Cooking Tools
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Feather
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? colors.primary : colors.muted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? colors.primary : colors.muted },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <GlassView intensity="strong" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Add Timer
              </Text>
              <GlassInput
                placeholder="Timer label (e.g., Pasta)"
                value={newTimerLabel}
                onChangeText={setNewTimerLabel}
              />
              <View style={styles.timerInputRow}>
                <GlassInput
                  placeholder="Minutes"
                  value={newTimerMinutes}
                  onChangeText={setNewTimerMinutes}
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
                <GradientButton title="Start" onPress={addTimer} size="md" />
              </View>
            </GlassView>

            {/* Active Timers */}
            {timers.map((timer, index) => (
              <Animated.View
                key={timer.id}
                entering={FadeInDown.delay(index * 50).duration(300)}
              >
                <GlassView intensity="strong" style={styles.timerCard}>
                  <View style={styles.timerHeader}>
                    <Text style={[styles.timerLabel, { color: colors.foreground }]}>
                      {timer.label}
                    </Text>
                    <TouchableOpacity onPress={() => removeTimer(timer.id)}>
                      <Feather name="x" size={20} color={colors.muted} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.timerTime, { color: colors.primary }]}>
                    {formatTime(timer.remainingSeconds)}
                  </Text>
                  <View style={styles.timerActions}>
                    <GlassButton
                      title={timer.isRunning ? 'Pause' : 'Resume'}
                      onPress={() => toggleTimer(timer.id)}
                      icon={
                        <Feather
                          name={timer.isRunning ? 'pause' : 'play'}
                          size={18}
                          color={colors.foreground}
                        />
                      }
                      size="sm"
                    />
                  </View>
                </GlassView>
              </Animated.View>
            ))}

            {timers.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="clock" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  No active timers
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Converter Tab */}
        {activeTab === 'converter' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <GlassView intensity="strong" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Unit Converter
              </Text>

              <View style={styles.converterTypes}>
                {(['volume', 'weight', 'temperature'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.converterType,
                      converterType === type && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setConverterType(type)}
                  >
                    <Text
                      style={[
                        styles.converterTypeText,
                        { color: converterType === type ? 'white' : colors.foreground },
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <GlassInput
                placeholder={
                  converterType === 'volume'
                    ? 'Enter cups'
                    : converterType === 'weight'
                    ? 'Enter ounces'
                    : 'Enter °F'
                }
                value={converterValue}
                onChangeText={setConverterValue}
                keyboardType="numeric"
              />

              <GradientButton title="Convert" onPress={handleConvert} fullWidth />

              {converterResult && (
                <View style={[styles.resultCard, { backgroundColor: colors.primary + '10' }]}>
                  <Text style={[styles.resultText, { color: colors.primary }]}>
                    {converterResult}
                  </Text>
                </View>
              )}
            </GlassView>
          </Animated.View>
        )}

        {/* Substitutions Tab */}
        {activeTab === 'substitutions' && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <GlassView intensity="strong" style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Ingredient Substitutions
              </Text>

              <View style={styles.searchRow}>
                <GlassInput
                  placeholder="Enter ingredient (e.g., butter)"
                  value={searchIngredient}
                  onChangeText={setSearchIngredient}
                  containerStyle={{ flex: 1 }}
                />
                <GradientButton title="Find" onPress={handleSearchSubstitutions} size="md" />
              </View>

              {substitutions.length > 0 && (
                <View style={styles.substitutionsList}>
                  <Text style={[styles.subsTitle, { color: colors.foreground }]}>
                    Substitutes for "{searchIngredient}":
                  </Text>
                  {substitutions.map((sub, index) => (
                    <View key={index} style={styles.substitutionItem}>
                      <View style={[styles.subsBullet, { backgroundColor: colors.secondary }]} />
                      <Text style={[styles.subsText, { color: colors.foreground }]}>{sub}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassView>
          </Animated.View>
        )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  timerInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  timerCard: {
    padding: 16,
    marginTop: 12,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerTime: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },
  timerActions: {
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  converterTypes: {
    flexDirection: 'row',
    gap: 8,
  },
  converterType: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  converterTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  substitutionsList: {
    marginTop: 8,
  },
  subsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  substitutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  subsBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subsText: {
    fontSize: 15,
  },
});
