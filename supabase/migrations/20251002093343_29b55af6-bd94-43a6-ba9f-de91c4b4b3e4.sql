-- Enable realtime for viewer_sessions table
ALTER TABLE public.viewer_sessions REPLICA IDENTITY FULL;

-- Add viewer_sessions to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.viewer_sessions;