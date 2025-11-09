-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION get_total_page_views()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.page_views;
$$;

CREATE OR REPLACE FUNCTION get_page_views_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_views BIGINT,
  unique_sessions BIGINT,
  top_pages JSON
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
    (
      SELECT JSON_AGG(page_data)
      FROM (
        SELECT 
          page_path,
          COUNT(*) as views
        FROM public.page_views
        WHERE created_at >= start_date AND created_at <= end_date
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 10
      ) page_data
    ) as top_pages
  FROM public.page_views
  WHERE created_at >= start_date AND created_at <= end_date;
$$;