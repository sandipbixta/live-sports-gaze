-- Fix the incorrect cron job that's calling non-existent function
SELECT cron.unschedule('daily-telegram-matches');

-- Recreate the morning job with correct function name
SELECT cron.schedule(
  'morning-telegram-matches',
  '0 8 * * *', -- 8:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/telegram-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
        body:='{"action": "post_daily_matches"}'::jsonb
    ) as request_id;
  $$
);