-- Drop the policy that exposes credentials to authenticated users
DROP POLICY IF EXISTS "Authenticated users can view public provider info" ON public.iptv_providers;

-- The "Service role can access IPTV providers" policy already exists and will remain
-- This ensures only service role (backend) can access credentials, not regular users