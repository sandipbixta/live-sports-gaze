-- Create table to track app downloads
CREATE TABLE IF NOT EXISTS public.app_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert downloads
CREATE POLICY "Anyone can track downloads" 
ON public.app_downloads 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to read download stats
CREATE POLICY "Anyone can view download stats" 
ON public.app_downloads 
FOR SELECT 
USING (true);

-- Create function to get download counts
CREATE OR REPLACE FUNCTION public.get_download_stats()
RETURNS TABLE(
  platform TEXT,
  total_downloads BIGINT
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    platform,
    COUNT(*)::BIGINT as total_downloads
  FROM public.app_downloads
  GROUP BY platform;
$$;