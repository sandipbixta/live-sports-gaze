-- Check what extensions are in public schema and move them
DO $$
DECLARE
    ext_name TEXT;
BEGIN
    -- Find and move extensions from public schema to extensions schema
    FOR ext_name IN 
        SELECT e.extname 
        FROM pg_extension e
        JOIN pg_namespace n ON e.extnamespace = n.oid
        WHERE n.nspname = 'public'
        AND e.extname IN ('pg_cron', 'pg_net', 'http', 'pgsodium', 'pg_graphql', 'pg_stat_statements', 'pgcrypto', 'pgjwt', 'uuid-ossp', 'ltree', 'pg_hashids')
    LOOP
        EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_name);
        RAISE NOTICE 'Moved extension % from public to extensions schema', ext_name;
    END LOOP;
END $$;