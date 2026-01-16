import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import {
  AppState,
  ChatSession,
  Message,
  Recipe,
  TodoItem,
  WorldRegion,
} from '@/types';
import {
  loadState,
  saveState,
  defaultState,
  createSession,
  addMessage as addMessageHelper,
  deleteSession as deleteSessionHelper,
  createTodo,
  toggleTodo as toggleTodoHelper,
  deleteTodo as deleteTodoHelper,
  saveRecipe as saveRecipeHelper,
  unsaveRecipe as unsaveRecipeHelper,
  createShoppingList,
  generateId,
} from '@/lib/storage';

// Action types
type AppAction =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_REGION'; payload: WorldRegion | 'all' }
  | { type: 'CREATE_SESSION'; payload?: string }
  | { type: 'SET_CURRENT_SESSION'; payload: string | null }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Omit<Message, 'id' | 'timestamp'> } }
  | { type: 'ADD_TODO'; payload: TodoItem }
  | { type: 'ADD_TODOS'; payload: TodoItem[] }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'CLEAR_COMPLETED_TODOS' }
  | { type: 'SAVE_RECIPE'; payload: Recipe }
  | { type: 'UNSAVE_RECIPE'; payload: string }
  | { type: 'ADD_SHOPPING_LIST'; payload: Recipe };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_REGION':
      return { ...state, selectedRegion: action.payload };

    case 'CREATE_SESSION': {
      const newSession = createSession(action.payload);
      return {
        ...state,
        sessions: [...state.sessions, newSession],
        currentSessionId: newSession.id,
      };
    }

    case 'SET_CURRENT_SESSION':
      return { ...state, currentSessionId: action.payload };

    case 'DELETE_SESSION': {
      const updatedSessions = deleteSessionHelper(state.sessions, action.payload);
      const newCurrentId =
        state.currentSessionId === action.payload
          ? updatedSessions[updatedSessions.length - 1]?.id || null
          : state.currentSessionId;
      return {
        ...state,
        sessions: updatedSessions,
        currentSessionId: newCurrentId,
      };
    }

    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: addMessageHelper(state.sessions, action.payload.sessionId, action.payload.message),
      };

    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };

    case 'ADD_TODOS':
      return { ...state, todos: [...state.todos, ...action.payload] };

    case 'TOGGLE_TODO':
      return { ...state, todos: toggleTodoHelper(state.todos, action.payload) };

    case 'DELETE_TODO':
      return { ...state, todos: deleteTodoHelper(state.todos, action.payload) };

    case 'CLEAR_COMPLETED_TODOS':
      return { ...state, todos: state.todos.filter((t) => !t.completed) };

    case 'SAVE_RECIPE':
      return { ...state, savedRecipes: saveRecipeHelper(state.savedRecipes, action.payload) };

    case 'UNSAVE_RECIPE':
      return { ...state, savedRecipes: unsaveRecipeHelper(state.savedRecipes, action.payload) };

    case 'ADD_SHOPPING_LIST': {
      const shoppingItems = createShoppingList(action.payload);
      return { ...state, todos: [...state.todos, ...shoppingItems] };
    }

    default:
      return state;
  }
}

// Context
interface AppStateContextType {
  state: AppState;
  isLoading: boolean;

  // Region
  setRegion: (region: WorldRegion | 'all') => void;

  // Sessions
  createNewSession: (title?: string) => string;
  setCurrentSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | undefined;

  // Messages
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;

  // Todos
  addTodo: (text: string, category?: TodoItem['category'], recipeId?: string) => void;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  clearCompletedTodos: () => void;
  addShoppingList: (recipe: Recipe) => void;

  // Recipes
  saveRecipe: (recipe: Recipe) => void;
  unsaveRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, defaultState);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load state on mount
  useEffect(() => {
    const load = async () => {
      try {
        const savedState = await loadState();
        dispatch({ type: 'SET_STATE', payload: savedState });
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Save state on changes
  useEffect(() => {
    if (!isLoading) {
      saveState(state);
    }
  }, [state, isLoading]);

  // Region
  const setRegion = useCallback((region: WorldRegion | 'all') => {
    dispatch({ type: 'SET_REGION', payload: region });
  }, []);

  // Sessions
  const createNewSession = useCallback((title?: string): string => {
    const newSession = createSession(title);
    dispatch({ type: 'CREATE_SESSION', payload: title });
    return newSession.id;
  }, []);

  const setCurrentSession = useCallback((sessionId: string | null) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
  }, []);

  const deleteSessionAction = useCallback((sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: sessionId });
  }, []);

  const getCurrentSession = useCallback(() => {
    return state.sessions.find((s) => s.id === state.currentSessionId);
  }, [state.sessions, state.currentSessionId]);

  // Messages
  const addMessageAction = useCallback(
    (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message } });
    },
    []
  );

  // Todos
  const addTodoAction = useCallback(
    (text: string, category: TodoItem['category'] = 'other', recipeId?: string) => {
      const todo = createTodo(text, category, recipeId);
      dispatch({ type: 'ADD_TODO', payload: todo });
    },
    []
  );

  const toggleTodoAction = useCallback((todoId: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: todoId });
  }, []);

  const deleteTodoAction = useCallback((todoId: string) => {
    dispatch({ type: 'DELETE_TODO', payload: todoId });
  }, []);

  const clearCompletedTodos = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED_TODOS' });
  }, []);

  const addShoppingListAction = useCallback((recipe: Recipe) => {
    dispatch({ type: 'ADD_SHOPPING_LIST', payload: recipe });
  }, []);

  // Recipes
  const saveRecipeAction = useCallback((recipe: Recipe) => {
    dispatch({ type: 'SAVE_RECIPE', payload: recipe });
  }, []);

  const unsaveRecipeAction = useCallback((recipeId: string) => {
    dispatch({ type: 'UNSAVE_RECIPE', payload: recipeId });
  }, []);

  const isRecipeSaved = useCallback(
    (recipeId: string) => {
      return state.savedRecipes.some((r) => r.id === recipeId);
    },
    [state.savedRecipes]
  );

  const value: AppStateContextType = {
    state,
    isLoading,
    setRegion,
    createNewSession,
    setCurrentSession,
    deleteSession: deleteSessionAction,
    getCurrentSession,
    addMessage: addMessageAction,
    addTodo: addTodoAction,
    toggleTodo: toggleTodoAction,
    deleteTodo: deleteTodoAction,
    clearCompletedTodos,
    addShoppingList: addShoppingListAction,
    saveRecipe: saveRecipeAction,
    unsaveRecipe: unsaveRecipeAction,
    isRecipeSaved,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
