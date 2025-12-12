-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to relevant roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pg_graphql extension to extensions schema (if it exists in public)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_graphql' AND extnamespace = 'public'::regnamespace) THEN
    ALTER EXTENSION pg_graphql SET SCHEMA extensions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Extension might not exist or can't be moved, skip
  NULL;
END $$;

-- Move uuid-ossp extension to extensions schema (if it exists in public)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND extnamespace = 'public'::regnamespace) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Move pgcrypto extension to extensions schema (if it exists in public)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto' AND extnamespace = 'public'::regnamespace) THEN
    ALTER EXTENSION pgcrypto SET SCHEMA extensions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;