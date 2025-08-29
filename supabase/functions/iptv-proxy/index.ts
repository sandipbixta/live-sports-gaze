import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IPTVProvider {
  id: string;
  name: string;
  base_url: string;
  username: string;
  password: string;
  playlist_type: string;
  output_format: string;
}

interface M3UChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  country?: string;
  language?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const providerId = url.searchParams.get('provider');

    console.log(`IPTV Proxy request: action=${action}, provider=${providerId}`);

    if (action === 'providers') {
      // Get all active IPTV providers
      const { data: providers, error } = await supabase
        .from('iptv_providers')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching providers:', error);
        throw error;
      }

      return new Response(JSON.stringify(providers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'channels') {
      if (!providerId) {
        return new Response(JSON.stringify({ error: 'Provider ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get provider configuration
      const { data: provider, error: providerError } = await supabase
        .from('iptv_providers')
        .select('*')
        .eq('id', providerId)
        .eq('is_active', true)
        .single();

      if (providerError || !provider) {
        console.error('Provider not found:', providerError);
        return new Response(JSON.stringify({ error: 'Provider not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch M3U playlist from IPTV provider
      const playlistUrl = `${provider.base_url}?username=${provider.username}&password=${provider.password}&type=${provider.playlist_type}&output=${provider.output_format}`;
      
      console.log(`Fetching playlist from: ${provider.base_url}`);
      
      const response = await fetch(playlistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
        return new Response(JSON.stringify({ error: 'Failed to fetch playlist from provider' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const m3uContent = await response.text();
      console.log(`Fetched playlist, size: ${m3uContent.length} chars`);

      // Parse M3U content
      const channels = parseM3U(m3uContent, provider.name);
      
      console.log(`Parsed ${channels.length} channels`);

      return new Response(JSON.stringify(channels), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('IPTV Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseM3U(content: string, providerName: string): M3UChannel[] {
  const channels: M3UChannel[] = [];
  const lines = content.split('\n');
  
  let currentChannel: Partial<M3UChannel> = {};
  let lineIndex = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('#EXTINF:')) {
      // Parse channel info line
      currentChannel = parseExtinf(trimmedLine, lineIndex, providerName);
    } else if (trimmedLine && !trimmedLine.startsWith('#') && currentChannel.name) {
      // This is a stream URL
      currentChannel.url = trimmedLine;
      
      // Add completed channel
      if (currentChannel.id && currentChannel.name && currentChannel.url) {
        channels.push(currentChannel as M3UChannel);
      }
      
      currentChannel = {};
    }
    
    lineIndex++;
  }

  // Filter for sports and general channels
  return channels.filter(channel => {
    const name = channel.name.toLowerCase();
    const group = channel.group.toLowerCase();
    
    return (
      group.includes('sport') ||
      group.includes('general') ||
      group.includes('news') ||
      name.includes('sport') ||
      name.includes('football') ||
      name.includes('soccer') ||
      name.includes('basketball') ||
      name.includes('tennis') ||
      name.includes('espn') ||
      name.includes('sky sports') ||
      name.includes('bein') ||
      name.includes('eurosport')
    );
  });
}

function parseExtinf(line: string, index: number, providerName: string): Partial<M3UChannel> {
  // Extract channel name (everything after the last comma)
  const commaIndex = line.lastIndexOf(',');
  const name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : `Channel ${index}`;
  
  // Extract attributes from the EXTINF line
  const logoMatch = line.match(/tvg-logo="([^"]+)"/);
  const groupMatch = line.match(/group-title="([^"]+)"/);
  const countryMatch = line.match(/tvg-country="([^"]+)"/);
  const langMatch = line.match(/tvg-language="([^"]+)"/);
  
  return {
    id: `${providerName.toLowerCase()}-${index}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: name,
    logo: logoMatch ? logoMatch[1] : '',
    group: groupMatch ? groupMatch[1] : 'General',
    country: countryMatch ? countryMatch[1] : '',
    language: langMatch ? langMatch[1] : 'Unknown'
  };
}