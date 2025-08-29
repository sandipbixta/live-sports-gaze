-- Properly remove the problematic Starshare provider
DELETE FROM public.iptv_providers WHERE name = 'Starshare';

-- Make sure only IPTV-org Sports is active
UPDATE public.iptv_providers 
SET is_active = false 
WHERE name != 'IPTV-org Sports';

-- Ensure IPTV-org Sports is active
UPDATE public.iptv_providers 
SET is_active = true 
WHERE name = 'IPTV-org Sports';