// Dynamic config that properly exposes environment variables
// IMPORTANT: Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY via EAS Secrets
// Run: eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value <your-url>
// Run: eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <your-key>
module.exports = ({ config }) => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not set. Set EAS Secrets for production builds.');
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      // Supabase configuration - available via Constants.expoConfig.extra
      supabaseUrl,
      supabaseAnonKey,
    },
  };
};
