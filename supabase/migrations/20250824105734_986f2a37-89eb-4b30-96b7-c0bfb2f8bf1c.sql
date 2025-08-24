-- Check if pg_cron extension is already installed, and install it if not
-- This is typically pre-installed in Supabase but we want to ensure it exists
DO $$ 
BEGIN
    -- pg_cron is typically already installed in Supabase
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        CREATE EXTENSION pg_cron;
    END IF;
    
    -- pg_net for HTTP requests from database
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        CREATE EXTENSION pg_net;
    END IF;
END $$;