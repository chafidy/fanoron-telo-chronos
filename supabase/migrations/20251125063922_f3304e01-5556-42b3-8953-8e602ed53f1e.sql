-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substring(NEW.id::text from 1 for 8)),
    NEW.raw_user_meta_data->>'avatar'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create online_games table
CREATE TABLE public.online_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed')),
  current_player INTEGER CHECK (current_player IN (1, 2)),
  phase TEXT CHECK (phase IN ('placement', 'movement')),
  winner INTEGER CHECK (winner IN (1, 2)),
  game_state JSONB NOT NULL DEFAULT '{"pieces": [], "turnStartTime": 0, "totalGameTime": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on online_games
ALTER TABLE public.online_games ENABLE ROW LEVEL SECURITY;

-- Create game_participants table
CREATE TABLE public.game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.online_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL CHECK (player_number IN (1, 2)),
  color TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id),
  UNIQUE(game_id, player_number)
);

-- Enable RLS on game_participants
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;

-- Now create policies that reference other tables
CREATE POLICY "Games are viewable by participants"
  ON public.online_games FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_participants
      WHERE game_participants.game_id = online_games.id
      AND game_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update games"
  ON public.online_games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.game_participants
      WHERE game_participants.game_id = online_games.id
      AND game_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create games"
  ON public.online_games FOR INSERT
  WITH CHECK (true);

-- Participants policies
CREATE POLICY "Participants are viewable by game members"
  ON public.game_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.game_participants gp
      WHERE gp.game_id = game_participants.game_id
      AND gp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join games"
  ON public.game_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_participants;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_online_games_updated_at
  BEFORE UPDATE ON public.online_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();