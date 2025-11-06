-- Create live chat messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  display_name text NOT NULL DEFAULT 'Anonymous',
  message text NOT NULL,
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-deleted messages
CREATE POLICY "Anyone can view non-deleted messages"
ON public.chat_messages
FOR SELECT
USING (is_deleted = false);

-- Anyone can insert their own messages
CREATE POLICY "Anyone can insert messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid());

-- Admins can delete any message
CREATE POLICY "Admins can delete messages"
ON public.chat_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_chat_messages_match_id ON public.chat_messages(match_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create match predictions table
CREATE TABLE public.match_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  display_name text NOT NULL DEFAULT 'Anonymous',
  predicted_winner text NOT NULL,
  predicted_score_home integer,
  predicted_score_away integer,
  confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high')),
  is_correct boolean,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  match_start_time timestamp with time zone NOT NULL,
  UNIQUE(match_id, session_id)
);

-- Enable RLS
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;

-- Anyone can view predictions
CREATE POLICY "Anyone can view predictions"
ON public.match_predictions
FOR SELECT
USING (true);

-- Anyone can insert predictions before match starts
CREATE POLICY "Anyone can insert predictions before match"
ON public.match_predictions
FOR INSERT
WITH CHECK (match_start_time > now());

-- Users can update their own predictions before match starts
CREATE POLICY "Users can update own predictions before match"
ON public.match_predictions
FOR UPDATE
USING (
  (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR user_id = auth.uid())
  AND match_start_time > now()
);

-- Admins can update any prediction (for scoring)
CREATE POLICY "Admins can update predictions"
ON public.match_predictions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index
CREATE INDEX idx_match_predictions_match_id ON public.match_predictions(match_id);
CREATE INDEX idx_match_predictions_leaderboard ON public.match_predictions(points_earned DESC, created_at DESC);

-- Create team statistics table
CREATE TABLE public.team_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name text NOT NULL,
  team_id text NOT NULL,
  sport text NOT NULL,
  league text,
  matches_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  losses integer DEFAULT 0,
  goals_scored integer DEFAULT 0,
  goals_conceded integer DEFAULT 0,
  clean_sheets integer DEFAULT 0,
  win_rate numeric,
  average_goals numeric,
  form_last_5 text[], -- Array like ['W', 'L', 'D', 'W', 'W']
  current_position integer,
  total_points integer DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, sport)
);

-- Enable RLS
ALTER TABLE public.team_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view team stats
CREATE POLICY "Anyone can view team stats"
ON public.team_stats
FOR SELECT
USING (true);

-- Admins can manage team stats
CREATE POLICY "Admins can insert team stats"
ON public.team_stats
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team stats"
ON public.team_stats
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index
CREATE INDEX idx_team_stats_sport ON public.team_stats(sport, team_id);

-- Create head to head comparison table
CREATE TABLE public.head_to_head_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_a_id text NOT NULL,
  team_a_name text NOT NULL,
  team_b_id text NOT NULL,
  team_b_name text NOT NULL,
  sport text NOT NULL,
  total_matches integer DEFAULT 0,
  team_a_wins integer DEFAULT 0,
  team_b_wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  last_5_results text[], -- Array like ['A', 'B', 'D', 'A', 'B'] where A = team_a won
  last_match_date timestamp with time zone,
  last_match_score text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_a_id, team_b_id, sport)
);

-- Enable RLS
ALTER TABLE public.head_to_head_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can view head to head stats
CREATE POLICY "Anyone can view head to head stats"
ON public.head_to_head_stats
FOR SELECT
USING (true);

-- Admins can manage head to head stats
CREATE POLICY "Admins can insert head to head stats"
ON public.head_to_head_stats
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update head to head stats"
ON public.head_to_head_stats
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index
CREATE INDEX idx_head_to_head_teams ON public.head_to_head_stats(team_a_id, team_b_id, sport);

-- Create prediction leaderboard view
CREATE OR REPLACE VIEW public.prediction_leaderboard AS
SELECT 
  display_name,
  session_id,
  user_id,
  COUNT(*) as total_predictions,
  SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_predictions,
  SUM(points_earned) as total_points,
  ROUND(
    (SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END)::numeric / 
    NULLIF(COUNT(*)::numeric, 0) * 100), 
    2
  ) as accuracy_percentage
FROM public.match_predictions
WHERE match_start_time < now() -- Only include past matches
GROUP BY display_name, session_id, user_id
ORDER BY total_points DESC, accuracy_percentage DESC
LIMIT 100;