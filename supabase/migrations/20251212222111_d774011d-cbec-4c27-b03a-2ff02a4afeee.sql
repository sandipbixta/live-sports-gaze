-- Delete the old cron job
SELECT cron.unschedule('update-team-stats-daily');

-- Create new cron job with the secret header
-- Note: The actual secret value will be referenced from Vault
SELECT cron.schedule(
  'update-team-stats-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/update-team-stats-scheduled',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.settings.cron_secret', true)
    ),
    body := '{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);