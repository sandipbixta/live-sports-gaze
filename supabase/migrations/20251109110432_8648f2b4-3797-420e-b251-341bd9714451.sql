-- Create page_views table to track all page visits
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);

-- Enable Row Level Security
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert page views (anonymous tracking)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read page view statistics
CREATE POLICY "Anyone can read page views"
ON public.page_views
FOR SELECT
USING (true);

-- Create function to get total page views
CREATE OR REPLACE FUNCTION get_total_page_views()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM public.page_views;
$$;

-- Create function to get page views by date range
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