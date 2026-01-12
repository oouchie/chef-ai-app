'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  Message,
  Recipe,
  WorldRegion,
  TodoItem,
} from '@/types';
import {
  loadState,
  saveState,
  defaultState,
  createSession,
  addMessage,
  deleteSession,
  saveRecipe,
  unsaveRecipe,
  createShoppingList,
  createTodo,
  toggleTodo,
  deleteTodo,
} from '@/lib/storage';
import { sendChatMessage, getStoredApiKey } from '@/lib/chat';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import SavedRecipes from '@/components/SavedRecipes';
import TodoList from '@/components/TodoList';
import CookingTools from '@/components/CookingTools';
import MealPlanner from '@/components/MealPlanner';
import Settings from '@/components/Settings';

export default function Home() {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedRecipesOpen, setSavedRecipesOpen] = useState(false);
  const [todosOpen, setTodosOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mealPlannerOpen, setMealPlannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedRecipeForTools, setSelectedRecipeForTools] = useState<Recipe | undefined>();
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setMounted(true);
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (mounted) {
      saveState(state);
    }
  }, [state, mounted]);

  // Get current session
  const currentSession = state.sessions.find(
    (s) => s.id === state.currentSessionId
  );

  // Create new session if none exists
  useEffect(() => {
    if (mounted && state.sessions.length === 0) {
      const newSession = createSession();
      setState((prev) => ({
        ...prev,
        sessions: [newSession],
        currentSessionId: newSession.id,
      }));
    }
  }, [mounted, state.sessions.length]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!state.currentSessionId) return;

      // Add user message
      const userMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'user',
        content,
      };

      setState((prev) => ({
        ...prev,
        sessions: addMessage(prev.sessions, prev.currentSessionId!, userMessage),
      }));

      setIsLoading(true);

      try {
        const updatedSession = state.sessions.find(
          (s) => s.id === state.currentSessionId
        );
        const conversationHistory = updatedSession?.messages.slice(-10) || [];

        // Use client-side chat function
        const apiKey = getStoredApiKey();
        const data = await sendChatMessage(
          content,
          state.selectedRegion,
          [
            ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content },
          ],
          apiKey || undefined
        );

        // Add assistant message
        const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
          role: 'assistant',
          content: data.response,
          recipe: data.recipe || undefined,
        };

        setState((prev) => ({
          ...prev,
          sessions: addMessage(
            prev.sessions,
            prev.currentSessionId!,
            assistantMessage
          ),
        }));

        // Update session title if first message
        if (updatedSession && updatedSession.messages.length === 0) {
          setState((prev) => ({
            ...prev,
            sessions: prev.sessions.map((s) =>
              s.id === prev.currentSessionId
                ? { ...s, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') }
                : s
            ),
          }));
        }
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message
        const errorMessage: Omit<Message, 'id' | 'timestamp'> = {
          role: 'assistant',
          content:
            "I'm sorry, I encountered an error. Please try again. You can add your API key in Settings for AI-powered responses.",
        };
        setState((prev) => ({
          ...prev,
          sessions: addMessage(
            prev.sessions,
            prev.currentSessionId!,
            errorMessage
          ),
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [state.currentSessionId, state.sessions, state.selectedRegion]
  );

  const handleNewSession = useCallback(() => {
    const newSession = createSession();
    setState((prev) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      currentSessionId: newSession.id,
    }));
    setSidebarOpen(false);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setState((prev) => ({ ...prev, currentSessionId: id }));
    setSidebarOpen(false);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setState((prev) => {
      const newSessions = deleteSession(prev.sessions, id);
      const newCurrentId =
        prev.currentSessionId === id
          ? newSessions[0]?.id || null
          : prev.currentSessionId;
      return {
        ...prev,
        sessions: newSessions,
        currentSessionId: newCurrentId,
      };
    });
  }, []);

  const handleRegionChange = useCallback((region: WorldRegion | 'all') => {
    setState((prev) => ({ ...prev, selectedRegion: region }));
  }, []);

  const handleSaveRecipe = useCallback((recipe: Recipe) => {
    setState((prev) => {
      const isAlreadySaved = prev.savedRecipes.some((r) => r.id === recipe.id);
      if (isAlreadySaved) {
        return {
          ...prev,
          savedRecipes: unsaveRecipe(prev.savedRecipes, recipe.id),
        };
      }
      return {
        ...prev,
        savedRecipes: saveRecipe(prev.savedRecipes, recipe),
      };
    });
  }, []);

  const handleAddToShoppingList = useCallback((recipe: Recipe) => {
    const shoppingItems = createShoppingList(recipe);
    setState((prev) => ({
      ...prev,
      todos: [...prev.todos, ...shoppingItems],
    }));
    setTodosOpen(true);
  }, []);

  const handleToggleTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: toggleTodo(prev.todos, id),
    }));
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: deleteTodo(prev.todos, id),
    }));
  }, []);

  const handleAddTodo = useCallback(
    (text: string, category: TodoItem['category']) => {
      const newTodo = createTodo(text, category);
      setState((prev) => ({
        ...prev,
        todos: [...prev.todos, newTodo],
      }));
    },
    []
  );

  const handleClearCompletedTodos = useCallback(() => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => !t.completed),
    }));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="text-5xl mb-4 block animate-bounce">👨‍🍳</span>
          <p className="text-muted">Loading Chef AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        sessions={state.sessions}
        currentSessionId={state.currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          selectedRegion={state.selectedRegion}
          onRegionChange={handleRegionChange}
          savedRecipesCount={state.savedRecipes.length}
          todosCount={state.todos.filter((t) => !t.completed).length}
          onOpenSavedRecipes={() => setSavedRecipesOpen(true)}
          onOpenTodos={() => setTodosOpen(true)}
          onOpenTools={() => {
            setSelectedRecipeForTools(state.savedRecipes[0]);
            setToolsOpen(true);
          }}
          onOpenMealPlanner={() => setMealPlannerOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 z-30 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Chat interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={currentSession?.messages || []}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            selectedRegion={state.selectedRegion}
            onSaveRecipe={handleSaveRecipe}
            onAddToShoppingList={handleAddToShoppingList}
            savedRecipeIds={state.savedRecipes.map((r) => r.id)}
          />
        </div>
      </div>

      {/* Saved recipes panel */}
      <SavedRecipes
        recipes={state.savedRecipes}
        onUnsave={(id) =>
          setState((prev) => ({
            ...prev,
            savedRecipes: unsaveRecipe(prev.savedRecipes, id),
          }))
        }
        onAddToShoppingList={handleAddToShoppingList}
        isOpen={savedRecipesOpen}
        onClose={() => setSavedRecipesOpen(false)}
      />

      {/* Todo list panel */}
      <TodoList
        todos={state.todos}
        savedRecipes={state.savedRecipes}
        onToggle={handleToggleTodo}
        onDelete={handleDeleteTodo}
        onAdd={handleAddTodo}
        onClearCompleted={handleClearCompletedTodos}
        isOpen={todosOpen}
        onClose={() => setTodosOpen(false)}
      />

      {/* Cooking tools modal */}
      <CookingTools
        recipe={selectedRecipeForTools}
        isOpen={toolsOpen}
        onClose={() => setToolsOpen(false)}
      />

      {/* Meal planner modal */}
      <MealPlanner
        savedRecipes={state.savedRecipes}
        isOpen={mealPlannerOpen}
        onClose={() => setMealPlannerOpen(false)}
        onAddToShoppingList={(recipes) => {
          recipes.forEach((recipe) => {
            const shoppingItems = createShoppingList(recipe);
            setState((prev) => ({
              ...prev,
              todos: [...prev.todos, ...shoppingItems],
            }));
          });
          setTodosOpen(true);
          setMealPlannerOpen(false);
        }}
      />

      {/* Settings modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
