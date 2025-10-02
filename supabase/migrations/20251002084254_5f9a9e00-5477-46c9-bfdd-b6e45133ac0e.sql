-- Ensure REPLICA IDENTITY is set to FULL for match_viewers table
ALTER TABLE public.match_viewers REPLICA IDENTITY FULL;