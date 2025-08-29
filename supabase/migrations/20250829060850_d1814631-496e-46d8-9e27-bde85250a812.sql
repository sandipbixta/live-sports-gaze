-- Create table to store IPTV provider configurations
CREATE TABLE IF NOT EXISTS public.iptv_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  playlist_type TEXT DEFAULT 'm3u_plus',
  output_format TEXT DEFAULT 'mpegts',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.iptv_providers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading provider configurations (public access for now)
CREATE POLICY "IPTV providers are readable by everyone" 
ON public.iptv_providers 
FOR SELECT 
USING (is_active = true);

-- Insert the Starshare provider
INSERT INTO public.iptv_providers (name, base_url, username, password, playlist_type, output_format)
VALUES (
  'Starshare',
  'https://starshare.fun/get.php',
  '702038389',
  '085848393',
  'm3u_plus',
  'mpegts'
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_iptv_providers_updated_at
BEFORE UPDATE ON public.iptv_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();