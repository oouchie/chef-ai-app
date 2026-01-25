import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Recipe, WorldRegion } from '@/types';

// Supabase configuration - use Constants.expoConfig.extra for reliable access in builds
const extra = Constants.expoConfig?.extra || {};
const SUPABASE_URL = extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging for troubleshooting (only in dev)
if (__DEV__) {
  console.log('Supabase URL configured:', SUPABASE_URL ? 'Yes' : 'No');
  console.log('Supabase Anon Key configured:', SUPABASE_ANON_KEY ? 'Yes' : 'No');
}

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;
let initializationError: Error | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (initializationError) {
    throw initializationError;
  }

  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      initializationError = new Error(
        'Supabase environment variables are not configured. ' +
        'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
      );
      throw initializationError;
    }

    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
    } catch (error) {
      initializationError = error instanceof Error
        ? error
        : new Error('Failed to initialize Supabase client');
      throw initializationError;
    }
  }
  return supabaseInstance;
}

// Chat response interface
interface ChatResponse {
  response: string;
  recipe: Recipe | null;
  isDemo: boolean;
}

// Send chat message via Supabase Edge Function
export async function sendChatMessageViaSupabase(
  message: string,
  region: WorldRegion | 'all',
  conversationHistory: { role: string; content: string }[]
): Promise<ChatResponse> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        message,
        region,
        history: conversationHistory,
      },
    });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }

    // Edge function returns { response, recipe } - add isDemo: false
    return {
      response: data.response,
      recipe: data.recipe || null,
      isDemo: false,
    };
  } catch (error) {
    console.error('Error calling Supabase Edge Function:', error);
    throw error;
  }
}

// Auth helpers (for future use)
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  return await supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = getSupabase();
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  return await supabase.auth.getUser();
}

export async function getCurrentSession() {
  const supabase = getSupabase();
  return await supabase.auth.getSession();
}
