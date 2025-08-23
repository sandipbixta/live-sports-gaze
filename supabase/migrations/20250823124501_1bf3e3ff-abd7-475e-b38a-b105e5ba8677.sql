-- Fix security issues by updating functions with proper search_path

-- Drop and recreate cleanup function with security definer
DROP FUNCTION IF EXISTS public.cleanup_inactive_viewers();
CREATE OR REPLACE FUNCTION public.cleanup_inactive_viewers()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.match_viewers 
  WHERE last_active < now() - INTERVAL '30 seconds';
END;
$$;

-- Drop and recreate viewer count function with security definer  
DROP FUNCTION IF EXISTS public.get_viewer_count(TEXT);
CREATE OR REPLACE FUNCTION public.get_viewer_count(match_id_param TEXT)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.match_viewers 
    WHERE match_id = match_id_param 
    AND last_active > now() - INTERVAL '30 seconds'
  );
END;
$$;