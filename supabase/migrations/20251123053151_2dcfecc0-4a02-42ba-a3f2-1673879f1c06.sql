-- Drop the existing prediction_leaderboard view
DROP VIEW IF EXISTS public.prediction_leaderboard;

-- Recreate the view without SECURITY DEFINER
-- This ensures it uses the permissions of the querying user, not the view creator
CREATE OR REPLACE VIEW public.prediction_leaderboard
WITH (security_invoker = true)  -- Explicitly use invoker's permissions
AS
SELECT 
  display_name,
  session_id,
  user_id,
  COUNT(*) AS total_predictions,
  SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) AS correct_predictions,
  SUM(points_earned) AS total_points,
  ROUND(
    SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END)::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    2
  ) AS accuracy_percentage
FROM public.match_predictions
WHERE match_start_time < NOW()
GROUP BY display_name, session_id, user_id
ORDER BY total_points DESC, accuracy_percentage DESC
LIMIT 100;

-- Add a comment explaining the security model
COMMENT ON VIEW public.prediction_leaderboard IS 
'Leaderboard view using security_invoker to respect RLS policies of the querying user. 
Aggregates public prediction data from match_predictions table.';

-- Grant appropriate permissions
GRANT SELECT ON public.prediction_leaderboard TO authenticated;
GRANT SELECT ON public.prediction_leaderboard TO anon;