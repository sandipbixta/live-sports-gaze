-- Fix cron job setup with correct extension usage
-- Remove any existing jobs first
DO $$
BEGIN
    -- Try to unschedule existing jobs if they exist
    PERFORM cron.unschedule('daily-telegram-live-matches') WHERE EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = 'daily-telegram-live-matches'
    );
    PERFORM cron.unschedule('evening-telegram-live-matches') WHERE EXISTS (
        SELECT 1 FROM cron.job WHERE jobname = 'evening-telegram-live-matches'
    );
EXCEPTION
    WHEN undefined_function THEN NULL;
END $$;

-- Create the cron jobs using proper function calls
SELECT cron.schedule(
  'daily-telegram-live-matches',
  '0 9 * * *', -- Every day at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/telegram-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
        body:='{"action": "post_daily_matches"}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'evening-telegram-live-matches', 
  '0 18 * * *', -- Every day at 6:00 PM UTC
  $$
  SELECT
    net.http_post(
        url:='https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/telegram-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
        body:='{"action": "post_daily_matches"}'::jsonb
    ) as request_id;
  $$
);