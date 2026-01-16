import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAppState } from '@/providers/AppStateProvider';
import { useToast } from '@/components/Toast';
import { Colors } from '@/theme';
import { sendChatMessage, getStoredApiKey } from '@/lib/chat';
import { hapticSuccess } from '@/lib/haptics';

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

  // Ensure we have a session
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

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
      const apiKey = await getStoredApiKey();
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage(
        message,
        state.selectedRegion,
        conversationHistory,
        apiKey || undefined
      );

      // Add assistant message
      addMessage(sessionId, {
        role: 'assistant',
        content: response.response,
        recipe: response.recipe || undefined,
      });

      if (response.isDemo) {
        showToast('Demo mode - Add API key in Settings for full experience', 'info');
      }
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

        {/* Chat Interface */}
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedRegion={state.selectedRegion}
          onSaveRecipe={handleSaveRecipe}
          onAddToShoppingList={handleAddToShoppingList}
          savedRecipeIds={savedRecipeIds}
          isPremium={false} // TODO: Add premium check
          onShowPaywall={handleShowPaywall}
        />
      </KeyboardAvoidingView>
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
});
