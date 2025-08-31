-- Drop viewer tracking table and functions completely
DROP TABLE IF EXISTS public.match_viewers;
DROP FUNCTION IF EXISTS public.get_viewer_count(text);
DROP FUNCTION IF EXISTS public.cleanup_inactive_viewers();