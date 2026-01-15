import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization to avoid build-time errors with static export
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export interface UserProfile {
  id: string;
  email: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  daily_requests: number;
}

export interface UsageResult {
  allowed: boolean;
  remaining: number;
  is_premium: boolean;
}

// Check if user can make a request (handles free tier limits)
export async function checkUsageLimit(userId: string): Promise<UsageResult> {
  const { data, error } = await getSupabase().rpc('check_usage_limit', {
    user_uuid: userId,
  });

  if (error) {
    console.error('Error checking usage:', error);
    // Default to allowing if error (fail open for better UX)
    return { allowed: true, remaining: 10, is_premium: false };
  }

  return data as UsageResult;
}

// Get user profile
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

// Update premium status (called by RevenueCat webhook)
export async function updatePremiumStatus(
  userId: string,
  isPremium: boolean,
  expiresAt?: string
) {
  const { error } = await getSupabase()
    .from('profiles')
    .update({
      is_premium: isPremium,
      premium_expires_at: expiresAt,
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating premium status:', error);
    throw error;
  }
}

// Call Claude via Edge Function (keeps API key secure)
export async function sendChatMessage(
  message: string,
  region: string,
  history: { role: string; content: string }[]
) {
  const { data, error } = await getSupabase().functions.invoke('chat', {
    body: { message, region, history },
  });

  if (error) {
    console.error('Chat error:', error);
    throw error;
  }

  return data;
}
