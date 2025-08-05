-- Enhanced user profiles with gems and streaks
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS win_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_games INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Add constraints
ALTER TABLE public.profiles ADD CONSTRAINT gems_positive CHECK (gems >= 0);
ALTER TABLE public.profiles ADD CONSTRAINT win_streak_positive CHECK (win_streak >= 0);
ALTER TABLE public.profiles ADD CONSTRAINT total_games_positive CHECK (total_games >= 0);
ALTER TABLE public.profiles ADD CONSTRAINT total_wins_positive CHECK (total_wins >= 0);

-- Create anonymous users table for IP-based tracking
CREATE TABLE IF NOT EXISTS public.anonymous_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  username TEXT NOT NULL DEFAULT 'Anonymous',
  gems INTEGER DEFAULT 10,
  win_streak INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.anonymous_users IS 'Stores anonymous user data based on IP address';
COMMENT ON COLUMN public.anonymous_users.ip_address IS 'IP address to identify anonymous users';
COMMENT ON COLUMN public.anonymous_users.gems IS 'Virtual currency for the game';

-- Enable RLS for anonymous users
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous users (more permissive since they're not authenticated)
CREATE POLICY "Anonymous users can view their own data" ON public.anonymous_users
  FOR SELECT USING (true);

CREATE POLICY "Anonymous users can update their own data" ON public.anonymous_users
  FOR UPDATE USING (true);

CREATE POLICY "Anonymous users can insert new data" ON public.anonymous_users
  FOR INSERT WITH CHECK (true);

-- Function to get or create anonymous user
CREATE OR REPLACE FUNCTION get_or_create_anonymous_user(user_ip INET)
RETURNS TABLE (
  id UUID,
  username TEXT,
  gems INTEGER,
  win_streak INTEGER,
  total_games INTEGER,
  total_wins INTEGER
) AS $$
DECLARE
  user_id UUID;
  user_username TEXT;
BEGIN
  -- Try to find existing anonymous user
  SELECT au.id, au.username, au.gems, au.win_streak, au.total_games, au.total_wins
  INTO user_id, user_username, gems, win_streak, total_games, total_wins
  FROM public.anonymous_users au
  WHERE au.ip_address = user_ip;
  
  -- If not found, create new anonymous user
  IF user_id IS NULL THEN
    INSERT INTO public.anonymous_users (ip_address, username, gems, win_streak, total_games, total_wins)
    VALUES (user_ip, 'Anonymous' || floor(random() * 10000)::text, 10, 0, 0, 0)
    RETURNING au.id, au.username, au.gems, au.win_streak, au.total_games, au.total_wins
    INTO user_id, user_username, gems, win_streak, total_games, total_wins;
  ELSE
    -- Update last seen
    UPDATE public.anonymous_users 
    SET last_seen = NOW() 
    WHERE id = user_id;
  END IF;
  
  RETURN QUERY SELECT user_id, user_username, gems, win_streak, total_games, total_wins;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update anonymous user stats
CREATE OR REPLACE FUNCTION update_anonymous_user_stats(
  user_ip INET,
  new_gems INTEGER DEFAULT NULL,
  new_win_streak INTEGER DEFAULT NULL,
  game_won BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.anonymous_users
  SET 
    gems = COALESCE(new_gems, gems),
    win_streak = COALESCE(new_win_streak, win_streak),
    total_games = total_games + 1,
    total_wins = total_wins + CASE WHEN game_won THEN 1 ELSE 0 END,
    last_seen = NOW()
  WHERE ip_address = user_ip;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert anonymous user to registered user
CREATE OR REPLACE FUNCTION convert_anonymous_to_registered(
  user_ip INET,
  registered_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  anonymous_data RECORD;
BEGIN
  -- Get anonymous user data
  SELECT * INTO anonymous_data
  FROM public.anonymous_users
  WHERE ip_address = user_ip;
  
  IF anonymous_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update registered user profile with anonymous data
  UPDATE public.profiles
  SET 
    gems = COALESCE(gems, 0) + anonymous_data.gems,
    win_streak = GREATEST(win_streak, anonymous_data.win_streak),
    total_games = COALESCE(total_games, 0) + anonymous_data.total_games,
    total_wins = COALESCE(total_wins, 0) + anonymous_data.total_wins,
    is_anonymous = FALSE,
    updated_at = NOW()
  WHERE id = registered_user_id;
  
  -- Delete anonymous user
  DELETE FROM public.anonymous_users WHERE ip_address = user_ip;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update games table to support anonymous users
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS anonymous_players JSONB DEFAULT '{}';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS current_anonymous_player_id UUID;

-- Add comments
COMMENT ON COLUMN public.games.anonymous_players IS 'JSON object containing anonymous player states';
COMMENT ON COLUMN public.games.current_anonymous_player_id IS 'Current anonymous player ID for turn-based games';

-- Update RLS policies for games to allow anonymous access
DROP POLICY IF EXISTS "Allow authenticated users to create games" ON public.games;
CREATE POLICY "Allow users to create games" ON public.games
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow players to view their own games" ON public.games;
CREATE POLICY "Allow players to view their games" ON public.games
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anonymous_users_ip ON public.anonymous_users(ip_address);
CREATE INDEX IF NOT EXISTS idx_anonymous_users_last_seen ON public.anonymous_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_profiles_gems ON public.profiles(gems);
CREATE INDEX IF NOT EXISTS idx_profiles_win_streak ON public.profiles(win_streak); 