-- Create table to track live viewers for matches
CREATE TABLE public.match_viewers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, session_id)
);

-- Create index for better performance
CREATE INDEX idx_match_viewers_match_id ON public.match_viewers(match_id);
CREATE INDEX idx_match_viewers_active ON public.match_viewers(match_id, last_active);

-- Enable Row Level Security
ALTER TABLE public.match_viewers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read viewer counts (public data)
CREATE POLICY "Anyone can view viewer counts" 
ON public.match_viewers 
FOR SELECT 
USING (true);

-- Create policy to allow inserting viewer records
CREATE POLICY "Anyone can join as viewer" 
ON public.match_viewers 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow updating own viewer record
CREATE POLICY "Can update own viewer record" 
ON public.match_viewers 
FOR UPDATE 
USING (true);

-- Create policy to allow deleting own viewer record
CREATE POLICY "Can delete own viewer record" 
ON public.match_viewers 
FOR DELETE 
USING (true);

-- Create function to clean up inactive viewers (older than 30 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_viewers()
RETURNS void AS $$
BEGIN
  DELETE FROM public.match_viewers 
  WHERE last_active < now() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- Create function to get live viewer count for a match
CREATE OR REPLACE FUNCTION public.get_viewer_count(match_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.match_viewers 
    WHERE match_id = match_id_param 
    AND last_active > now() - INTERVAL '30 seconds'
  );
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for the table
ALTER TABLE public.match_viewers REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.match_viewers;