-- Create match_viewers table to track real viewer counts
CREATE TABLE IF NOT EXISTS public.match_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL UNIQUE,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_viewers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read viewer counts (public data)
CREATE POLICY "Anyone can view match viewer counts"
ON public.match_viewers
FOR SELECT
TO public
USING (true);

-- Create function to get viewer count for a match
CREATE OR REPLACE FUNCTION public.get_viewer_count(match_id_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_count INTEGER;
BEGIN
  SELECT match_viewers.viewer_count INTO viewer_count
  FROM public.match_viewers
  WHERE match_viewers.match_id = match_id_param;
  
  RETURN COALESCE(viewer_count, 0);
END;
$$;

-- Create function to increment viewer count (called when someone watches a match)
CREATE OR REPLACE FUNCTION public.increment_viewer_count(match_id_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert or update viewer count
  INSERT INTO public.match_viewers (match_id, viewer_count, last_updated)
  VALUES (match_id_param, 1, now())
  ON CONFLICT (match_id) 
  DO UPDATE SET 
    viewer_count = match_viewers.viewer_count + 1,
    last_updated = now()
  RETURNING viewer_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Create function to decrement viewer count (called when someone stops watching)
CREATE OR REPLACE FUNCTION public.decrement_viewer_count(match_id_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.match_viewers
  SET 
    viewer_count = GREATEST(0, viewer_count - 1),
    last_updated = now()
  WHERE match_id = match_id_param
  RETURNING viewer_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_match_viewers_match_id ON public.match_viewers(match_id);
CREATE INDEX IF NOT EXISTS idx_match_viewers_viewer_count ON public.match_viewers(viewer_count DESC);