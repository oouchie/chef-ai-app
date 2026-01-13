-- RecipePilot Database Schema

-- User profiles with subscription status
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  revenue_cat_id TEXT,
  daily_requests INTEGER DEFAULT 0,
  last_request_date DATE DEFAULT CURRENT_DATE
);

-- Usage tracking for free tier limits
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_type TEXT DEFAULT 'chat'
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to check and increment daily usage
CREATE OR REPLACE FUNCTION check_usage_limit(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  profile_record profiles%ROWTYPE;
  daily_limit INTEGER := 10; -- Free tier limit
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;

  -- Premium users have unlimited access
  IF profile_record.is_premium AND profile_record.premium_expires_at > NOW() THEN
    RETURN json_build_object('allowed', true, 'remaining', -1, 'is_premium', true);
  END IF;

  -- Reset daily count if new day
  IF profile_record.last_request_date < CURRENT_DATE THEN
    UPDATE profiles SET daily_requests = 0, last_request_date = CURRENT_DATE WHERE id = user_uuid;
    profile_record.daily_requests := 0;
  END IF;

  -- Check limit
  IF profile_record.daily_requests >= daily_limit THEN
    RETURN json_build_object('allowed', false, 'remaining', 0, 'is_premium', false);
  END IF;

  -- Increment and return
  UPDATE profiles SET daily_requests = daily_requests + 1 WHERE id = user_uuid;

  RETURN json_build_object(
    'allowed', true,
    'remaining', daily_limit - profile_record.daily_requests - 1,
    'is_premium', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
