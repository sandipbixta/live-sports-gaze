-- Move extensions from public to extensions schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Install extensions in the proper extensions schema
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Recreate the cron jobs with proper schema references
SELECT extensions.cron.schedule(
  'daily-telegram-live-matches',
  '0 9 * * *', -- Every day at 9:00 AM UTC
  $$
  SELECT
    extensions.http_post(
        url:='https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/telegram-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
        body:='{"action": "post_daily_matches"}'::jsonb
    ) as request_id;
  $$
);

SELECT extensions.cron.schedule(
  'evening-telegram-live-matches', 
  '0 18 * * *', -- Every day at 6:00 PM UTC
  $$
  SELECT
    extensions.http_post(
        url:='https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/telegram-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
        body:='{"action": "post_daily_matches"}'::jsonb
    ) as request_id;
  $$
);