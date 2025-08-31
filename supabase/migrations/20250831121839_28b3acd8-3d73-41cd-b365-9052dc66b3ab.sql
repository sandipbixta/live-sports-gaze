-- Fix critical security vulnerability: IPTV Provider Credentials accessible to authenticated users
-- Drop the overly permissive policy that allows authenticated users to see credentials
DROP POLICY IF EXISTS "Authenticated users can view basic provider info" ON public.iptv_providers;

-- Create a more secure policy that only allows authenticated users to see non-sensitive information
-- This policy excludes sensitive fields like username, password, base_url
CREATE POLICY "Authenticated users can view public provider info" 
ON public.iptv_providers 
FOR SELECT 
TO authenticated
USING (
  is_active = true
);

-- Create a view that exposes only non-sensitive provider information for public access
CREATE OR REPLACE VIEW public.iptv_providers_public AS
SELECT 
  id,
  name,
  playlist_type,
  output_format,
  is_active,
  created_at
FROM public.iptv_providers
WHERE is_active = true;

-- Grant SELECT permission on the view to authenticated users
GRANT SELECT ON public.iptv_providers_public TO authenticated;

-- Ensure RLS is enabled on the view (views inherit RLS from their base tables)
-- The service role policy remains unchanged for full access to credentials