// Dynamic config that properly exposes environment variables
module.exports = ({ config }) => {
  // Supabase configuration with hardcoded fallbacks for production
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bwddfoqaqgrbendjgchr.supabase.co';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZGRmb3FhcWdyYmVuZGpnY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjY4NzQsImV4cCI6MjA4MzkwMjg3NH0.oQLjkXCHpOIrd4ZKOcOX3MEbWmtWosOOqGRTsNTjHsk';

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
