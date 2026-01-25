import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  TextInput,
  Text,
  useColorScheme,
  Keyboard,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients, Shadows, EditorialColors } from '@/theme';
import { Message, Recipe, WorldRegion, WORLD_REGIONS } from '@/types';
import { hapticLight } from '@/lib/haptics';

import MessageBubble, { LoadingBubble } from './MessageBubble';
import QuickPrompts from './QuickPrompts';
import RecipeCard from '@/components/recipe/RecipeCard';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  selectedRegion: WorldRegion | 'all';
  onSaveRecipe: (recipe: Recipe) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  isPremium?: boolean;
  onShowPaywall?: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  selectedRegion,
  onSaveRecipe,
  onAddToShoppingList,
  savedRecipeIds,
  isPremium = false,
  onShowPaywall,
}: ChatInterfaceProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  // Tab bar height (matches (tabs)/_layout.tsx)
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 65;

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    hapticLight();
    setInput('');
    Keyboard.dismiss();
    await onSendMessage(trimmedInput);
  }, [input, isLoading, onSendMessage]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  }, []);

  const handleVoiceInput = useCallback(() => {
    if (!isPremium) {
      onShowPaywall?.();
      return;
    }
    // Voice input - requires native implementation
    hapticLight();
  }, [isPremium, onShowPaywall]);

  const renderRecipeCard = useCallback(
    (recipe: Recipe) => (
      <RecipeCard
        recipe={recipe}
        onSave={() => onSaveRecipe(recipe)}
        onAddToShoppingList={() => onAddToShoppingList(recipe)}
        isSaved={savedRecipeIds.includes(recipe.id)}
      />
    ),
    [savedRecipeIds, onSaveRecipe, onAddToShoppingList]
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageBubble
        message={item}
        renderRecipeCard={renderRecipeCard}
        index={index}
      />
    ),
    [renderRecipeCard]
  );

  // Get region info for display
  const regionInfo = selectedRegion === 'all'
    ? null
    : WORLD_REGIONS.find(r => r.id === selectedRegion);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Messages or Empty State */}
      {messages.length === 0 ? (
        <QuickPrompts
          onSelectPrompt={handleQuickPrompt}
          isPremium={isPremium}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          ListFooterComponent={isLoading ? <LoadingBubble /> : null}
          ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
        />
      )}

      {/* Input Area - Warm editorial styling */}
      <View
        style={[
          styles.inputWrapper,
          {
            paddingBottom: TAB_BAR_HEIGHT + 8,
            borderTopColor: colors.borderLight,
          },
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Warm cream overlay for input area */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? EditorialColors.glassWarmDark
                : EditorialColors.glassWarmLight
            }
          ]}
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: Platform.OS === 'android'
                ? (isDark ? colors.card : colors.cardElevated)
                : 'transparent',
            },
          ]}
        >
          {/* Region Indicator - Elegant badge style */}
          {regionInfo && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[
                styles.regionIndicator,
                {
                  backgroundColor: isDark
                    ? colors.accent + '15'
                    : colors.accent + '12',
                  borderColor: colors.accent + '30',
                }
              ]}
            >
              <Text style={styles.regionFlag}>{regionInfo.flag}</Text>
              <Text style={[styles.regionText, { color: colors.accent }]}>
                {regionInfo.name} Cuisine
              </Text>
            </Animated.View>
          )}

          <View style={styles.inputRow}>
            {/* Text Input - Warm cream tint */}
            <View
              style={[
                styles.textInputContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(37, 32, 25, 0.8)'
                    : 'rgba(255, 253, 251, 0.9)',
                  borderColor: isDark
                    ? EditorialColors.glassBorderWarmDark
                    : EditorialColors.glassBorderWarmLight,
                },
                Shadows.sm,
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[styles.textInput, { color: colors.foreground }]}
                value={input}
                onChangeText={setInput}
                placeholder="Ask me about any recipe..."
                placeholderTextColor={colors.muted}
                multiline
                maxLength={1000}
                editable={!isLoading}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            </View>

            {/* Voice Button - Subtle styling */}
            <Pressable
              style={({ pressed }) => [
                styles.voiceButton,
                {
                  backgroundColor: isPremium
                    ? colors.secondary + '20'
                    : (isDark ? colors.card : colors.cardElevated),
                  borderColor: isPremium
                    ? colors.secondary + '40'
                    : colors.borderLight,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
                Shadows.sm,
              ]}
              onPress={handleVoiceInput}
              disabled={isLoading}
            >
              <Feather
                name="mic"
                size={20}
                color={isPremium ? colors.secondary : colors.muted}
              />
              {!isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                  <Feather name="star" size={8} color="white" />
                </View>
              )}
            </Pressable>

            {/* Send Button - Terracotta gradient */}
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
              style={({ pressed }) => [
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
                input.trim() && !isLoading && Shadows.glowPrimary,
                { transform: [{ scale: pressed && input.trim() ? 0.94 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={18} color="white" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingTop: 20,
    paddingHorizontal: 4,
  },
  messageSeparator: {
    height: 8,
  },
  inputWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  inputContainer: {
    padding: 14,
    paddingTop: 10,
  },
  regionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
  },
  regionFlag: {
    fontSize: 14,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 46,
    maxHeight: 120,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    fontWeight: '400',
  },
  voiceButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  premiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    borderRadius: 23,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonGradient: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
