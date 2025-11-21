-- Add user_id column to email_subscriptions if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'email_subscriptions' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.email_subscriptions 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.email_subscriptions;

-- Create a restrictive SELECT policy that only allows users to view their own subscription
CREATE POLICY "Users can view their own subscription by user_id or email"
ON public.email_subscriptions
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Update INSERT policy to remain permissive for guest signups
-- but we'll handle user_id in the application layer

-- Update the UPDATE policy to be more restrictive
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.email_subscriptions;

CREATE POLICY "Users can update their own subscription by user_id or email"
ON public.email_subscriptions
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);