-- Schedule the team stats update to run daily at 2 AM UTC
SELECT cron.schedule(
  'update-team-stats-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/update-team-stats-scheduled',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnN0ZWFheXhneWdpaHBzaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzNDMsImV4cCI6MjA2NDM0OTM0M30.L2OVGuYiiynekERIwZceuH42iKVAD_YPJL25HXV6ing"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);