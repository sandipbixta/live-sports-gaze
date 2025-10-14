-- Create user favorites table for tracking favorite teams/leagues
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  favorite_type TEXT NOT NULL CHECK (favorite_type IN ('team', 'league', 'match')),
  favorite_id TEXT NOT NULL,
  favorite_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, favorite_type, favorite_id)
);

-- Create email subscriptions table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_teams TEXT[] DEFAULT '{}',
  subscribed_leagues TEXT[] DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watch history table
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  match_title TEXT NOT NULL,
  sport_id TEXT NOT NULL,
  watch_duration INTEGER DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, match_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Anyone can view their own favorites by session"
ON public.user_favorites FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert their own favorites"
ON public.user_favorites FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own favorites by session"
ON public.user_favorites FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete their own favorites by session"
ON public.user_favorites FOR DELETE
USING (true);

-- RLS Policies for email_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.email_subscriptions FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert subscription"
ON public.email_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own subscription"
ON public.email_subscriptions FOR UPDATE
USING (true);

-- RLS Policies for watch_history
CREATE POLICY "Anyone can view their own watch history"
ON public.watch_history FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert watch history"
ON public.watch_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update their own watch history"
ON public.watch_history FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete their own watch history"
ON public.watch_history FOR DELETE
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_user_favorites_session ON public.user_favorites(session_id);
CREATE INDEX idx_user_favorites_type ON public.user_favorites(favorite_type, favorite_id);
CREATE INDEX idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX idx_watch_history_session ON public.watch_history(session_id);
CREATE INDEX idx_watch_history_match ON public.watch_history(match_id);

-- Create trigger for updating email_subscriptions updated_at
CREATE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();