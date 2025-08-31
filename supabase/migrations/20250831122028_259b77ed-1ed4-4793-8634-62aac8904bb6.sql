-- Fix the security definer view issue by replacing it with a security definer function
-- Drop the view that was flagged as a security risk
DROP VIEW IF EXISTS public.iptv_providers_public;

-- Create a security definer function instead to safely expose non-sensitive provider data
CREATE OR REPLACE FUNCTION public.get_public_iptv_providers()
RETURNS TABLE (
  id uuid,
  name text,
  playlist_type text,
  output_format text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.playlist_type,
    p.output_format,
    p.is_active,
    p.created_at
  FROM public.iptv_providers p
  WHERE p.is_active = true;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_iptv_providers() TO authenticated;

-- Add comment explaining the security purpose
COMMENT ON FUNCTION public.get_public_iptv_providers() IS 'Returns non-sensitive IPTV provider information for authenticated users. Credentials (username, password, base_url) are excluded for security.';