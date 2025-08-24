-- Create a daily cron job to send matches at 8:00 AM UTC
SELECT cron.schedule(
  'daily-telegram-matches',
  '0 8 * * *', -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/telegram-daily-matches',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
      body := '{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);