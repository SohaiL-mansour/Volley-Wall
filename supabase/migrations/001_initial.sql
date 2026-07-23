-- Volley Wall Supabase schema

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nickname text UNIQUE,
  full_name text,
  age int,
  mobile text UNIQUE,
  avatar_url text,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname, full_name, age, mobile, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'nickname',
    new.raw_user_meta_data ->> 'full_name',
    (new.raw_user_meta_data ->> 'age')::int,
    new.raw_user_meta_data ->> 'mobile',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Friend requests
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_id, to_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Friend requests visible to involved users" ON public.friend_requests FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);
CREATE POLICY "Users can send friend requests" ON public.friend_requests FOR INSERT WITH CHECK (auth.uid() = from_id);
CREATE POLICY "Involved users can update friend requests" ON public.friend_requests FOR UPDATE USING (auth.uid() = from_id OR auth.uid() = to_id);
CREATE POLICY "Involved users can delete friend requests" ON public.friend_requests FOR DELETE USING (auth.uid() = from_id OR auth.uid() = to_id);

-- Tournaments
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  price int NOT NULL DEFAULT 150,
  base_teams int NOT NULL DEFAULT 0,
  max_teams int NOT NULL,
  team_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Only admins can insert tournaments" ON public.tournaments FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Only admins can update tournaments" ON public.tournaments FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Only admins can delete tournaments" ON public.tournaments FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Tournament teams / invites
CREATE TABLE IF NOT EXISTS public.tournament_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  player1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, player1_id, player2_id)
);

ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournament teams are viewable" ON public.tournament_teams FOR SELECT USING (true);
CREATE POLICY "Users can register their own team" ON public.tournament_teams FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "Teammates and admins can update team" ON public.tournament_teams FOR UPDATE USING (
  auth.uid() = player1_id OR auth.uid() = player2_id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
CREATE POLICY "Admins can delete teams" ON public.tournament_teams FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Update tournament team_count when invite accepted/rejected
CREATE OR REPLACE FUNCTION public.update_tournament_team_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE public.tournaments SET team_count = team_count + 1 WHERE id = NEW.tournament_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
      UPDATE public.tournaments SET team_count = team_count + 1 WHERE id = NEW.tournament_id;
    ELSIF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
      UPDATE public.tournaments SET team_count = GREATEST(0, team_count - 1) WHERE id = NEW.tournament_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE public.tournaments SET team_count = GREATEST(0, team_count - 1) WHERE id = OLD.tournament_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_team_count ON public.tournament_teams;
CREATE TRIGGER update_team_count
AFTER INSERT OR UPDATE OR DELETE ON public.tournament_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_tournament_team_count();

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team1_id uuid NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
  team2_id uuid NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
  scheduled_time text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Only admins can insert matches" ON public.matches FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Only admins can update matches" ON public.matches FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Only admins can delete matches" ON public.matches FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Match results
CREATE TABLE IF NOT EXISTS public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team1_goals int NOT NULL DEFAULT 0,
  team2_goals int NOT NULL DEFAULT 0,
  winner_team_id uuid REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match results are viewable" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Only admins can insert results" ON public.match_results FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Only admins can update results" ON public.match_results FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
CREATE POLICY "Only admins can delete results" ON public.match_results FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Update player stats automatically when a result is recorded or changed
CREATE OR REPLACE FUNCTION public.update_stats_from_result()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_match_team1_id uuid;
  old_match_team2_id uuid;
  old_loser_team_id uuid;
  old_winner uuid[];
  old_loser uuid[];
  new_match_team1_id uuid;
  new_match_team2_id uuid;
  new_loser_team_id uuid;
  new_winner uuid[];
  new_loser uuid[];
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.winner_team_id IS DISTINCT FROM NEW.winner_team_id) THEN
    -- reverse old result on update
    IF TG_OP = 'UPDATE' AND OLD.winner_team_id IS NOT NULL THEN
      SELECT team1_id, team2_id INTO old_match_team1_id, old_match_team2_id FROM public.matches WHERE id = OLD.match_id;
      old_loser_team_id := CASE WHEN OLD.winner_team_id = old_match_team1_id THEN old_match_team2_id ELSE old_match_team1_id END;

      SELECT COALESCE(array_agg(player_id), ARRAY[]::uuid[]) INTO old_winner FROM (
        SELECT player1_id AS player_id FROM public.tournament_teams WHERE id = OLD.winner_team_id
        UNION ALL SELECT player2_id FROM public.tournament_teams WHERE id = OLD.winner_team_id
      ) t;
      SELECT COALESCE(array_agg(player_id), ARRAY[]::uuid[]) INTO old_loser FROM (
        SELECT player1_id AS player_id FROM public.tournament_teams WHERE id = old_loser_team_id
        UNION ALL SELECT player2_id FROM public.tournament_teams WHERE id = old_loser_team_id
      ) t;

      UPDATE public.profiles SET wins = GREATEST(0, wins - 1) WHERE id = ANY(old_winner);
      UPDATE public.profiles SET losses = GREATEST(0, losses - 1) WHERE id = ANY(old_loser);
      UPDATE public.profiles SET points = wins*10 + GREATEST(0, wins - losses)*2 WHERE id = ANY(old_winner || old_loser);
    END IF;

    -- apply new result
    IF NEW.winner_team_id IS NOT NULL THEN
      SELECT team1_id, team2_id INTO new_match_team1_id, new_match_team2_id FROM public.matches WHERE id = NEW.match_id;
      new_loser_team_id := CASE WHEN NEW.winner_team_id = new_match_team1_id THEN new_match_team2_id ELSE new_match_team1_id END;

      SELECT COALESCE(array_agg(player_id), ARRAY[]::uuid[]) INTO new_winner FROM (
        SELECT player1_id AS player_id FROM public.tournament_teams WHERE id = NEW.winner_team_id
        UNION ALL SELECT player2_id FROM public.tournament_teams WHERE id = NEW.winner_team_id
      ) t;
      SELECT COALESCE(array_agg(player_id), ARRAY[]::uuid[]) INTO new_loser FROM (
        SELECT player1_id AS player_id FROM public.tournament_teams WHERE id = new_loser_team_id
        UNION ALL SELECT player2_id FROM public.tournament_teams WHERE id = new_loser_team_id
      ) t;

      UPDATE public.profiles SET wins = wins + 1 WHERE id = ANY(new_winner);
      UPDATE public.profiles SET losses = losses + 1 WHERE id = ANY(new_loser);
      UPDATE public.profiles SET points = wins*10 + GREATEST(0, wins - losses)*2 WHERE id = ANY(new_winner || new_loser);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_stats_after_result ON public.match_results;
CREATE TRIGGER update_stats_after_result
AFTER INSERT OR UPDATE ON public.match_results
FOR EACH ROW
EXECUTE FUNCTION public.update_stats_from_result();
