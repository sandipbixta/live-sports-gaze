-- Drop the old match_viewers table and functions
DROP TABLE IF EXISTS public.match_viewers CASCADE;
DROP FUNCTION IF EXISTS public.increment_viewer_count(text);
DROP FUNCTION IF EXISTS public.decrement_viewer_count(text);
DROP FUNCTION IF EXISTS public.get_viewer_count(text);

-- Create new viewer_sessions table with individual session tracking
CREATE TABLE public.viewer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL,
  session_id text NOT NULL,
  last_heartbeat timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(match_id, session_id)
);

-- Enable RLS
ALTER TABLE public.viewer_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can view sessions (for counting)
CREATE POLICY "Anyone can view viewer sessions"
  ON public.viewer_sessions
  FOR SELECT
  USING (true);

-- Anyone can upsert their own session (heartbeat)
CREATE POLICY "Anyone can update viewer sessions"
  ON public.viewer_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their session heartbeat"
  ON public.viewer_sessions
  FOR UPDATE
  USING (true);

-- Add index for faster queries
CREATE INDEX idx_viewer_sessions_match_heartbeat 
  ON public.viewer_sessions(match_id, last_heartbeat);

-- Function to update heartbeat (upsert)
CREATE OR REPLACE FUNCTION public.heartbeat_viewer(
  match_id_param text,
  session_id_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.viewer_sessions (match_id, session_id, last_heartbeat)
  VALUES (match_id_param, session_id_param, now())
  ON CONFLICT (match_id, session_id)
  DO UPDATE SET last_heartbeat = now();
END;
$$;

-- Function to get viewer count (sessions active in last 30 seconds)
CREATE OR REPLACE FUNCTION public.get_viewer_count(match_id_param text)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  viewer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO viewer_count
  FROM public.viewer_sessions
  WHERE match_id = match_id_param
    AND last_heartbeat > now() - interval '30 seconds';
  
  RETURN COALESCE(viewer_count, 0);
END;
$$;

-- Function to clean up old sessions (called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_stale_viewer_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.viewer_sessions
  WHERE last_heartbeat < now() - interval '1 minute';
END;
$$;

-- Enable realtime for the new table
ALTER TABLE public.viewer_sessions REPLICA IDENTITY FULL;