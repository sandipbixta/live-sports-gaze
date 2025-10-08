-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily blog generation at 9:00 AM UTC every day
SELECT cron.schedule(
  'generate-daily-blog-post',
  '0 9 * * *', -- Every day at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/generate-daily-blog',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);