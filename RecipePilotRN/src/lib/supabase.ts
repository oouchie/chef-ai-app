import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Recipe, WorldRegion } from '@/types';

// Supabase configuration - use Constants.expoConfig.extra for reliable access in builds
const extra = Constants.expoConfig?.extra || {};

// HARDCODED FALLBACKS - These MUST work in production
const FALLBACK_URL = 'https://bwddfoqaqgrbendjgchr.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZGRmb3FhcWdyYmVuZGpnY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjY4NzQsImV4cCI6MjA4MzkwMjg3NH0.oQLjkXCHpOIrd4ZKOcOX3MEbWmtWosOOqGRTsNTjHsk';

const SUPABASE_URL = extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Debug logging (works in production too via remote debugger)
console.log('[Supabase] URL source:', extra.supabaseUrl ? 'extra' : (process.env.EXPO_PUBLIC_SUPABASE_URL ? 'env' : 'fallback'));
console.log('[Supabase] Key source:', extra.supabaseAnonKey ? 'extra' : (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'env' : 'fallback'));
console.log('[Supabase] URL configured:', SUPABASE_URL ? 'Yes' : 'No');
console.log('[Supabase] Key configured:', SUPABASE_ANON_KEY ? 'Yes (length: ' + SUPABASE_ANON_KEY.length + ')' : 'No');

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
  conversationHistory: { role: string; content: string }[],
  image?: { base64: string; mimeType: string }
): Promise<ChatResponse> {
  console.log('[Supabase] Starting chat request...');
  console.log('[Supabase] URL:', SUPABASE_URL);
  console.log('[Supabase] Key length:', SUPABASE_ANON_KEY?.length || 0);

  let supabase;
  try {
    supabase = getSupabase();
    console.log('[Supabase] Client initialized successfully');
  } catch (initError: any) {
    console.error('[Supabase] Client init failed:', initError?.message);
    throw new Error(`Supabase init failed: ${initError?.message}`);
  }

  try {
    console.log('[Supabase] Invoking chat function...');
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        message,
        region,
        history: conversationHistory,
        ...(image && {
          image: {
            data: image.base64,
            media_type: image.mimeType,
          },
        }),
      },
    });

    if (error) {
      console.error('[Supabase] Edge Function error:', error);
      throw new Error(`Edge Function error: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) {
      console.error('[Supabase] No data returned');
      throw new Error('No data returned from Edge Function');
    }

    console.log('[Supabase] Success! Response length:', data.response?.length || 0);

    // Edge function returns { response, recipe } - add isDemo: false
    return {
      response: data.response,
      recipe: data.recipe || null,
      isDemo: false,
    };
  } catch (error: any) {
    console.error('[Supabase] Error calling Edge Function:', error?.message || error);
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
