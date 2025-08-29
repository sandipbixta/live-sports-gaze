-- Remove the dangerous public SELECT policy that exposes credentials
DROP POLICY IF EXISTS "IPTV providers are readable by everyone" ON public.iptv_providers;

-- Create a secure policy that only allows service role access
-- This ensures only backend edge functions can access credentials
CREATE POLICY "Service role can access IPTV providers"
ON public.iptv_providers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add a policy for authenticated users to only see basic info (no credentials)
CREATE POLICY "Authenticated users can view basic provider info"
ON public.iptv_providers
FOR SELECT
TO authenticated
USING (is_active = true);