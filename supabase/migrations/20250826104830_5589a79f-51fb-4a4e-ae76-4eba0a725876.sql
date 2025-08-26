-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a daily cron job to post live matches to Telegram at 9:00 AM UTC
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

-- Create another job for evening matches at 6:00 PM UTC
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