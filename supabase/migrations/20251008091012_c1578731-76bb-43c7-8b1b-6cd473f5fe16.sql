-- Update get_viewer_count to use a 30-second window instead of 10 seconds
-- This prevents viewers from disappearing due to timing issues
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