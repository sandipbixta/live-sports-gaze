-- Update viewer count function to use 10 second timeout
CREATE OR REPLACE FUNCTION public.get_viewer_count(match_id_param text)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  viewer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO viewer_count
  FROM public.viewer_sessions
  WHERE match_id = match_id_param
    AND last_heartbeat > now() - interval '10 seconds';
  
  RETURN COALESCE(viewer_count, 0);
END;
$function$;

-- Update cleanup function to remove stale sessions after 20 seconds
CREATE OR REPLACE FUNCTION public.cleanup_stale_viewer_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.viewer_sessions
  WHERE last_heartbeat < now() - interval '20 seconds';
END;
$function$;