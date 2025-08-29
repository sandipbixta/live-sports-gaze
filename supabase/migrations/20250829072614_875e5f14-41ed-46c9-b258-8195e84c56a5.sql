-- Remove the problematic Starshare provider that causes memory issues
DELETE FROM public.iptv_providers WHERE name = 'Starshare IPTV';

-- Add the reliable IPTV-org sports provider
INSERT INTO public.iptv_providers (
  name, 
  base_url, 
  username, 
  password, 
  playlist_type, 
  output_format, 
  is_active
) VALUES (
  'IPTV-org Sports',
  'https://iptv-org.github.io/iptv/categories/sports.m3u',
  '',
  '',
  'direct',
  'direct',
  true
);