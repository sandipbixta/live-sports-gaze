-- Update cleanup function to match the 30-second viewer window
CREATE OR REPLACE FUNCTION public.cleanup_stale_viewer_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.viewer_sessions
  WHERE last_heartbeat < now() - interval '60 seconds';
END;
$$;