-- Create ad performance tracking table
CREATE TABLE IF NOT EXISTS public.ad_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ad_type TEXT NOT NULL, -- 'native', 'popunder', 'direct_link', 'social_bar', 'interstitial'
  ad_unit_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'impression', 'click'
  page_path TEXT,
  session_id TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  country TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ad_performance_created_at ON public.ad_performance(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_performance_ad_type ON public.ad_performance(ad_type);
CREATE INDEX IF NOT EXISTS idx_ad_performance_event_type ON public.ad_performance(event_type);

-- Enable RLS but allow all inserts (public tracking)
ALTER TABLE public.ad_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert ad events"
  ON public.ad_performance
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read ad events"
  ON public.ad_performance
  FOR SELECT
  TO public
  USING (true);

-- Function to get ad stats for dashboard
CREATE OR REPLACE FUNCTION public.get_ad_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
  ad_type TEXT,
  impressions BIGINT,
  clicks BIGINT,
  ctr NUMERIC,
  estimated_revenue NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.ad_type,
    COUNT(*) FILTER (WHERE ap.event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE ap.event_type = 'click') as clicks,
    CASE 
      WHEN COUNT(*) FILTER (WHERE ap.event_type = 'impression') > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE ap.event_type = 'click')::NUMERIC / COUNT(*) FILTER (WHERE ap.event_type = 'impression')::NUMERIC * 100), 2)
      ELSE 0
    END as ctr,
    -- Estimated revenue based on typical Adsterra CPMs
    CASE ap.ad_type
      WHEN 'popunder' THEN COUNT(*) FILTER (WHERE ap.event_type = 'impression')::NUMERIC * 0.003 -- $3 CPM
      WHEN 'interstitial' THEN COUNT(*) FILTER (WHERE ap.event_type = 'impression')::NUMERIC * 0.004 -- $4 CPM
      WHEN 'native' THEN COUNT(*) FILTER (WHERE ap.event_type = 'impression')::NUMERIC * 0.0015 -- $1.5 CPM
      WHEN 'social_bar' THEN COUNT(*) FILTER (WHERE ap.event_type = 'impression')::NUMERIC * 0.001 -- $1 CPM
      ELSE COUNT(*) FILTER (WHERE ap.event_type = 'impression')::NUMERIC * 0.002 -- $2 CPM default
    END as estimated_revenue
  FROM public.ad_performance ap
  WHERE ap.created_at >= start_date AND ap.created_at <= end_date
  GROUP BY ap.ad_type
  ORDER BY estimated_revenue DESC;
END;
$$;