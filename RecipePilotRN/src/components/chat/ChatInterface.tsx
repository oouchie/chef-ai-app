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
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients, Shadows } from '@/theme';
import { Message, Recipe, WorldRegion } from '@/types';
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
    // TODO: Implement voice input
    console.log('Voice input pressed');
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
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        renderRecipeCard={renderRecipeCard}
      />
    ),
    [renderRecipeCard]
  );

  const regionName = selectedRegion === 'all'
    ? null
    : selectedRegion.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <View style={styles.container}>
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
            { paddingBottom: 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          ListFooterComponent={isLoading ? <LoadingBubble /> : null}
        />
      )}

      {/* Input Area */}
      <Animated.View
        entering={FadeInUp.duration(300)}
        style={[
          styles.inputWrapper,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: Platform.OS === 'android' ? colors.card : 'transparent',
            },
          ]}
        >
          {/* Region Indicator */}
          {regionName && (
            <View style={[styles.regionIndicator, { backgroundColor: colors.primary + '10' }]}>
              <Text style={styles.regionEmoji}>🎯</Text>
              <Text style={[styles.regionText, { color: colors.muted }]}>
                Focused on {regionName} cuisine
              </Text>
            </View>
          )}

          <View style={styles.inputRow}>
            {/* Text Input */}
            <View
              style={[
                styles.textInputContainer,
                {
                  backgroundColor: colors.glassBackground,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[styles.textInput, { color: colors.foreground }]}
                value={input}
                onChangeText={setInput}
                placeholder="Ask me for a recipe..."
                placeholderTextColor={colors.muted}
                multiline
                maxLength={1000}
                editable={!isLoading}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            </View>

            {/* Voice Button */}
            <Pressable
              style={({ pressed }) => [
                styles.voiceButton,
                {
                  backgroundColor: isPremium ? colors.primary : colors.glassBackground,
                  borderColor: colors.glassBorder,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
              onPress={handleVoiceInput}
              disabled={isLoading}
            >
              <Feather
                name="mic"
                size={20}
                color={isPremium ? 'white' : colors.muted}
              />
              {!isPremium && (
                <View style={[styles.premiumIndicator, { backgroundColor: colors.secondary }]}>
                  <Text style={styles.premiumStar}>⭐</Text>
                </View>
              )}
            </Pressable>

            {/* Send Button */}
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
              style={({ pressed }) => [
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
                input.trim() && !isLoading && Shadows.glowPrimary,
                { transform: [{ scale: pressed && input.trim() ? 0.92 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={Gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={20} color="white" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingTop: 16,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  inputContainer: {
    padding: 12,
    paddingTop: 8,
  },
  regionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  regionEmoji: {
    fontSize: 14,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  premiumIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumStar: {
    fontSize: 10,
  },
  sendButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
