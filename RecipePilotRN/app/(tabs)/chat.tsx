import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors, Shadows } from '@/theme';
import { sendChatMessage } from '@/lib/chat';
import { hapticSuccess, hapticLight, hapticSelection } from '@/lib/haptics';
import { WORLD_REGIONS, WorldRegion } from '@/types';

import Header from '@/components/navigation/Header';
import Sidebar from '@/components/navigation/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const {
    state,
    createNewSession,
    setCurrentSession,
    addMessage,
    getCurrentSession,
    saveRecipe,
    addShoppingList,
    isRecipeSaved,
    setRegion,
    deleteSession,
  } = useAppState();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showRegionSheet, setShowRegionSheet] = useState(false);

  // Ensure we have a session
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  const selectedRegionInfo =
    state.selectedRegion === 'all'
      ? { name: 'All Cuisines', flag: '🌎', id: 'all' as const }
      : WORLD_REGIONS.find((r) => r.id === state.selectedRegion);

  const handleSendMessage = useCallback(async (message: string) => {
    // Create session if none exists
    let sessionId = state.currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }

    // Add user message
    addMessage(sessionId, { role: 'user', content: message });

    setIsLoading(true);
    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage(
        message,
        state.selectedRegion,
        conversationHistory
      );

      // Add assistant message
      addMessage(sessionId, {
        role: 'assistant',
        content: response.response,
        recipe: response.recipe || undefined,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to get response. Please try again.', 'error');
      addMessage(sessionId, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [state.currentSessionId, state.selectedRegion, messages, createNewSession, addMessage, showToast]);

  const handleSaveRecipe = useCallback((recipe: any) => {
    saveRecipe(recipe);
    hapticSuccess();
    showToast('Recipe saved!', 'success');
  }, [saveRecipe, showToast]);

  const handleAddToShoppingList = useCallback((recipe: any) => {
    router.push({
      pathname: '/(modals)/ingredients',
      params: { recipe: JSON.stringify(recipe) },
    });
  }, []);

  const handleNewChat = useCallback(() => {
    createNewSession();
    setIsSidebarOpen(false);
    hapticSuccess();
  }, [createNewSession]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSession(sessionId);
    setIsSidebarOpen(false);
  }, [setCurrentSession]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    deleteSession(sessionId);
    showToast('Chat deleted', 'info');
  }, [deleteSession, showToast]);

  const handleShowPaywall = useCallback(() => {
    router.push('/(modals)/paywall');
  }, []);

  const handleRegionSelect = useCallback((region: WorldRegion | 'all') => {
    hapticSelection();
    setRegion(region);
    setShowRegionSheet(false);
  }, [setRegion]);

  const savedRecipeIds = state.savedRecipes.map((r) => r.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={state.sessions}
        currentSessionId={state.currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <Header
          onMenuPress={() => setIsSidebarOpen(true)}
          onNewChat={handleNewChat}
          selectedRegion={state.selectedRegion}
          onRegionChange={setRegion}
          onToolsPress={() => router.push('/(modals)/tools')}
          onMealPlannerPress={() => router.push('/(modals)/meal-planner')}
          onRestaurantPress={() => router.push('/(modals)/restaurant')}
        />

        {/* Region Selector Pill - positioned below header */}
        <View style={styles.regionPillContainer}>
          <TouchableOpacity
            style={[
              styles.regionPill,
              {
                backgroundColor: isDark
                  ? 'rgba(37, 32, 25, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                borderColor: colors.border,
              },
              Shadows.md,
            ]}
            onPress={() => {
              hapticLight();
              setShowRegionSheet(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.regionPillFlag}>{selectedRegionInfo?.flag}</Text>
            <Text style={[styles.regionPillText, { color: colors.foreground }]}>
              {selectedRegionInfo?.name}
            </Text>
            <Feather name="chevron-down" size={14} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Chat Interface */}
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedRegion={state.selectedRegion}
          onSaveRecipe={handleSaveRecipe}
          onAddToShoppingList={handleAddToShoppingList}
          savedRecipeIds={savedRecipeIds}
          isPremium={false}
          onShowPaywall={handleShowPaywall}
        />
      </KeyboardAvoidingView>

      {/* Region Selection Bottom Sheet */}
      <Modal
        visible={showRegionSheet}
        transparent
        animationType="none"
        onRequestClose={() => setShowRegionSheet(false)}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.sheetBackdrop}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowRegionSheet(false)}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.regionSheet,
            {
              backgroundColor: isDark ? colors.card : colors.background,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.sheetHandle}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Title */}
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
            Select Cuisine
          </Text>

          {/* Region Options */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.regionOptions}
          >
            {/* All Cuisines */}
            <TouchableOpacity
              style={[
                styles.regionOption,
                state.selectedRegion === 'all' && {
                  backgroundColor: colors.primary + '12',
                  borderColor: colors.primary,
                },
                { borderColor: colors.border },
              ]}
              onPress={() => handleRegionSelect('all')}
            >
              <Text style={styles.regionOptionFlag}>🌎</Text>
              <Text
                style={[
                  styles.regionOptionText,
                  {
                    color: state.selectedRegion === 'all'
                      ? colors.primary
                      : colors.foreground,
                  },
                ]}
              >
                All Cuisines
              </Text>
              {state.selectedRegion === 'all' && (
                <Feather name="check" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>

            {/* Individual Regions */}
            {WORLD_REGIONS.map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionOption,
                  state.selectedRegion === region.id && {
                    backgroundColor: colors.primary + '12',
                    borderColor: colors.primary,
                  },
                  { borderColor: colors.border },
                ]}
                onPress={() => handleRegionSelect(region.id)}
              >
                <Text style={styles.regionOptionFlag}>{region.flag}</Text>
                <Text
                  style={[
                    styles.regionOptionText,
                    {
                      color: state.selectedRegion === region.id
                        ? colors.primary
                        : colors.foreground,
                    },
                  ]}
                >
                  {region.name}
                </Text>
                {state.selectedRegion === region.id && (
                  <Feather name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  regionPillContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    zIndex: 50,
  },
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  regionPillFlag: {
    fontSize: 18,
  },
  regionPillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 22, 20, 0.4)',
  },
  regionSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    ...Shadows.xl,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  regionOptions: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  regionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  regionOptionFlag: {
    fontSize: 20,
  },
  regionOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});
