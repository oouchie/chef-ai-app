import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  TextInput,
  Text,
  Image,
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
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Gradients, Shadows, EditorialColors } from '@/theme';
import { Message, Recipe, WorldRegion, WORLD_REGIONS } from '@/types';
import { hapticLight } from '@/lib/haptics';
import { useVoiceInput, useImagePicker } from '@/hooks';
import type { ImageData } from '@/hooks';

import MessageBubble, { LoadingBubble } from './MessageBubble';
import QuickPrompts from './QuickPrompts';
import RecipeCard from '@/components/recipe/RecipeCard';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, imageData?: { base64: string; mimeType: string; uri: string }) => Promise<void>;
  isLoading: boolean;
  selectedRegion: WorldRegion | 'all';
  onSaveRecipe: (recipe: Recipe) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  isPremium?: boolean;
  onShowPaywall?: () => void;
  onMealPlannerPress?: () => void;
  onRestaurantPress?: () => void;
  remainingRequests?: number | 'unlimited';
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
  onMealPlannerPress,
  onRestaurantPress,
  remainingRequests = 'unlimited',
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

  // Voice input setup
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput({
    onTranscript: (text) => {
      // When final transcript is received, set it in the input
      setInput(text);
      inputRef.current?.focus();
    },
    onError: (error) => {
      console.warn('Voice input error:', error);
    },
  });

  // Image picker setup
  const [pendingImage, setPendingImage] = useState<ImageData | null>(null);

  const { isAvailable: isImagePickerAvailable, isProcessing: isImageProcessing, pickImage } = useImagePicker({
    onImagePicked: (image) => {
      setPendingImage(image);
      hapticLight();
    },
    onError: (error) => {
      console.warn('Image picker error:', error);
    },
  });

  // Animated scale for voice button pulsing
  const voicePulse = useSharedValue(1);

  // Start pulsing animation when listening
  useEffect(() => {
    if (isListening) {
      voicePulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      voicePulse.value = withSpring(1);
    }
  }, [isListening, voicePulse]);

  // Update input with interim transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  const voiceButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voicePulse.value }],
  }));

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
    const hasImage = !!pendingImage;
    if ((!trimmedInput && !hasImage) || isLoading) return;

    hapticLight();

    const imageData = pendingImage ? {
      base64: pendingImage.base64,
      mimeType: pendingImage.mimeType,
      uri: pendingImage.uri,
    } : undefined;

    const messageText = trimmedInput || 'What can I make with this?';

    setInput('');
    setPendingImage(null);
    Keyboard.dismiss();
    await onSendMessage(messageText, imageData);
  }, [input, isLoading, onSendMessage, pendingImage]);

  const handleCameraPress = useCallback(() => {
    if (pendingImage) {
      setPendingImage(null);
      hapticLight();
      return;
    }
    pickImage();
  }, [pendingImage, pickImage]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  }, []);

  const handleVoiceInput = useCallback(async () => {
    if (!isPremium) {
      onShowPaywall?.();
      return;
    }

    // Toggle listening state
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isPremium, onShowPaywall, isListening, startListening, stopListening]);

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
          onMealPlannerPress={onMealPlannerPress}
          onRestaurantPress={onRestaurantPress}
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
          {/* Region & Requests Row */}
          <View style={styles.indicatorRow}>
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

            {/* Remaining Requests for Free Users */}
            {!isPremium && remainingRequests !== 'unlimited' && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={[
                  styles.requestsIndicator,
                  {
                    backgroundColor: remainingRequests <= 3
                      ? colors.warning + '15'
                      : colors.muted + '15',
                    borderColor: remainingRequests <= 3
                      ? colors.warning + '40'
                      : colors.muted + '30',
                  }
                ]}
              >
                <Feather
                  name="message-circle"
                  size={12}
                  color={remainingRequests <= 3 ? colors.warning : colors.muted}
                />
                <Text
                  style={[
                    styles.requestsText,
                    { color: remainingRequests <= 3 ? colors.warning : colors.muted }
                  ]}
                >
                  {remainingRequests}/10 free
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Pending Image Preview */}
          {pendingImage && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.imagePreviewRow}
            >
              <Image
                source={{ uri: pendingImage.uri }}
                style={styles.imagePreviewThumb}
              />
              <Text style={[styles.imagePreviewText, { color: colors.muted }]}>
                Photo attached
              </Text>
              <Pressable
                onPress={() => { setPendingImage(null); hapticLight(); }}
                style={styles.imagePreviewRemove}
              >
                <Feather name="x-circle" size={18} color={colors.error} />
              </Pressable>
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

            {/* Camera Button */}
            <Pressable
              style={({ pressed }) => [
                styles.cameraButton,
                {
                  backgroundColor: pendingImage
                    ? colors.success + '20'
                    : (isDark ? colors.card : colors.cardElevated),
                  borderColor: pendingImage
                    ? colors.success + '40'
                    : colors.borderLight,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                },
                Shadows.sm,
              ]}
              onPress={handleCameraPress}
              disabled={isLoading || isImageProcessing}
            >
              <Feather
                name={pendingImage ? 'check-circle' : 'camera'}
                size={20}
                color={pendingImage ? colors.success : colors.muted}
              />
            </Pressable>

            {/* Voice Button - Animated when listening */}
            <Animated.View style={voiceButtonAnimatedStyle}>
              <Pressable
                style={({ pressed }) => [
                  styles.voiceButton,
                  {
                    backgroundColor: isListening
                      ? colors.error + '30'
                      : isPremium
                        ? colors.secondary + '20'
                        : (isDark ? colors.card : colors.cardElevated),
                    borderColor: isListening
                      ? colors.error
                      : isPremium
                        ? colors.secondary + '40'
                        : colors.borderLight,
                    transform: [{ scale: pressed && !isListening ? 0.94 : 1 }],
                  },
                  isListening && styles.voiceButtonListening,
                  Shadows.sm,
                ]}
                onPress={handleVoiceInput}
                disabled={isLoading}
              >
                <Feather
                  name={isListening ? 'mic-off' : 'mic'}
                  size={20}
                  color={isListening ? colors.error : isPremium ? colors.secondary : colors.muted}
                />
                {!isPremium && !isListening && (
                  <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                    <Feather name="star" size={8} color="white" />
                  </View>
                )}
                {isListening && (
                  <View style={[styles.listeningDot, { backgroundColor: colors.error }]} />
                )}
              </Pressable>
            </Animated.View>

            {/* Send Button - Terracotta gradient */}
            <Pressable
              onPress={handleSend}
              disabled={(!input.trim() && !pendingImage) || isLoading}
              style={({ pressed }) => [
                styles.sendButton,
                ((!input.trim() && !pendingImage) || isLoading) && styles.sendButtonDisabled,
                (input.trim() || pendingImage) && !isLoading && Shadows.glowPrimary,
                { transform: [{ scale: pressed && (input.trim() || pendingImage) ? 0.94 : 1 }] },
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
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  regionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
  },
  requestsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
  },
  requestsText: {
    fontSize: 11,
    fontWeight: '600',
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
  cameraButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 10,
  },
  imagePreviewThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  imagePreviewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  imagePreviewRemove: {
    padding: 4,
  },
  voiceButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  voiceButtonListening: {
    borderWidth: 2,
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
  listeningDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
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
