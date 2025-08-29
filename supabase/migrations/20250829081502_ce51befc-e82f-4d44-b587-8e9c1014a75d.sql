-- Add Starshare Xtream Codes provider to the database
INSERT INTO public.iptv_providers (name, base_url, username, password, playlist_type, output_format, is_active)
VALUES (
  'Starshare IPTV',
  'https://starshare.fun',
  '702038389',
  '085848393',
  'xtream_codes',
  'mpegts',
  true
);