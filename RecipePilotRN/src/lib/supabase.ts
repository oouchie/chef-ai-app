import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, WorldRegion } from '@/types';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not configured');
    }
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
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
        conversationHistory,
      },
    });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }

    return data as ChatResponse;
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
