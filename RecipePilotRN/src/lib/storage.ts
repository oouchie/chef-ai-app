import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, ChatSession, TodoItem, Recipe, Message, WorldRegion } from '@/types';

const STORAGE_KEY = 'recipe-chatbot-data';
const API_KEY_STORAGE = 'chef-ai-api-key';
const RESTAURANT_TRIAL_KEY = 'recipepilot_restaurant_trial_used';

export const defaultState: AppState = {
  sessions: [],
  currentSessionId: null,
  todos: [],
  savedRecipes: [],
  selectedRegion: 'all',
};

export async function loadState(): Promise<AppState> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return defaultState;
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Session helpers
export function createSession(title?: string, id?: string): ChatSession {
  const now = Date.now();
  return {
    id: id || generateId(),
    title: title || `Chat ${new Date().toLocaleDateString()}`,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addMessage(
  sessions: ChatSession[],
  sessionId: string,
  message: Omit<Message, 'id' | 'timestamp'>
): ChatSession[] {
  return sessions.map((s) =>
    s.id === sessionId
      ? {
          ...s,
          messages: [
            ...s.messages,
            { ...message, id: generateId(), timestamp: Date.now() },
          ],
          updatedAt: Date.now(),
        }
      : s
  );
}

export function deleteSession(sessions: ChatSession[], sessionId: string): ChatSession[] {
  return sessions.filter((s) => s.id !== sessionId);
}

// Todo helpers
export function createTodo(
  text: string,
  category: TodoItem['category'] = 'other',
  recipeId?: string
): TodoItem {
  return {
    id: generateId(),
    text,
    completed: false,
    recipeId,
    category,
    createdAt: Date.now(),
  };
}

export function toggleTodo(todos: TodoItem[], todoId: string): TodoItem[] {
  return todos.map((t) =>
    t.id === todoId ? { ...t, completed: !t.completed } : t
  );
}

export function deleteTodo(todos: TodoItem[], todoId: string): TodoItem[] {
  return todos.filter((t) => t.id !== todoId);
}

export function updateTodo(
  todos: TodoItem[],
  todoId: string,
  updates: Partial<TodoItem>
): TodoItem[] {
  return todos.map((t) => (t.id === todoId ? { ...t, ...updates } : t));
}

// Recipe helpers
export function saveRecipe(recipes: Recipe[], recipe: Recipe): Recipe[] {
  if (recipes.some((r) => r.id === recipe.id)) {
    return recipes;
  }
  return [...recipes, recipe];
}

export function unsaveRecipe(recipes: Recipe[], recipeId: string): Recipe[] {
  return recipes.filter((r) => r.id !== recipeId);
}

export function isRecipeSaved(recipes: Recipe[], recipeId: string): boolean {
  return recipes.some((r) => r.id === recipeId);
}

// Create todos from recipe ingredients
export function createShoppingList(recipe: Recipe): TodoItem[] {
  if (!recipe?.ingredients || !Array.isArray(recipe.ingredients)) {
    console.warn('Recipe has no ingredients:', recipe);
    return [];
  }
  return recipe.ingredients.map((ing) =>
    createTodo(
      `${ing.amount || ''} ${ing.unit || ''} ${ing.name || 'Unknown'}${ing.notes ? ` (${ing.notes})` : ''}`.trim(),
      'shopping',
      recipe.id
    )
  );
}

// Create todos from recipe instructions
export function createCookingChecklist(recipe: Recipe): TodoItem[] {
  if (!recipe?.instructions || !Array.isArray(recipe.instructions)) {
    console.warn('Recipe has no instructions:', recipe);
    return [];
  }
  return recipe.instructions.map((instruction, index) =>
    createTodo(`Step ${index + 1}: ${instruction}`, 'cooking', recipe.id)
  );
}

// Restaurant recipe trial tracking
export async function hasUsedRestaurantTrial(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(RESTAURANT_TRIAL_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markRestaurantTrialUsed(): Promise<void> {
  try {
    await AsyncStorage.setItem(RESTAURANT_TRIAL_KEY, 'true');
  } catch (error) {
    console.error('Failed to mark trial as used:', error);
  }
}

// API Key storage (async versions)
export async function getStoredApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export async function setStoredApiKey(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(API_KEY_STORAGE, key);
  } catch (error) {
    console.error('Failed to store API key:', error);
  }
}

export async function removeStoredApiKey(): Promise<void> {
  try {
    await AsyncStorage.removeItem(API_KEY_STORAGE);
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
}
