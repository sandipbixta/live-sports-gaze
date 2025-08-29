import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Xtream Codes API endpoints
const getXtreamUrl = (baseUrl: string, username: string, password: string, action: string) => {
  const cleanUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  switch (action) {
    case 'categories':
      return `${cleanUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;
    case 'streams':
      return `${cleanUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    case 'stream_info':
      return `${cleanUrl}/player_api.php?username=${username}&password=${password}&action=get_live_stream_info`;
    case 'account_info':
      return `${cleanUrl}/player_api.php?username=${username}&password=${password}&action=get_account_info`;
    default:
      return `${cleanUrl}/player_api.php?username=${username}&password=${password}`;
  }
};

const getStreamUrl = (baseUrl: string, username: string, password: string, streamId: string, extension: string = 'ts') => {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  return `${cleanUrl}/live/${username}/${password}/${streamId}.${extension}`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const providerId = url.searchParams.get('provider');
    const categoryId = url.searchParams.get('category');
    const streamId = url.searchParams.get('stream');

    console.log(`🎬 Xtream Proxy: ${action} for provider ${providerId}`);

    if (action === 'providers') {
      // Get all Xtream Codes providers
      const { data: providers, error } = await supabase
        .from('iptv_providers')
        .select('id, name, is_active')
        .eq('playlist_type', 'xtream_codes')
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching Xtream providers:', error);
        throw error;
      }

      console.log(`✅ Found ${providers?.length || 0} Xtream providers`);
      return new Response(JSON.stringify(providers || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!providerId) {
      throw new Error('Provider ID is required');
    }

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('iptv_providers')
      .select('*')
      .eq('id', providerId)
      .eq('playlist_type', 'xtream_codes')
      .single();

    if (providerError || !provider) {
      console.error('❌ Provider not found:', providerError);
      throw new Error('Provider not found');
    }

    const { base_url, username, password } = provider;
    console.log(`📡 Using provider: ${provider.name} at ${base_url}`);

    switch (action) {
      case 'categories': {
        const apiUrl = getXtreamUrl(base_url, username, password, 'categories');
        console.log(`🔍 Fetching categories from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Xtream API error: ${response.status} ${response.statusText}`);
        }
        
        const categories = await response.json();
        console.log(`✅ Found ${categories?.length || 0} categories`);
        
        return new Response(JSON.stringify(categories || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'streams': {
        const apiUrl = getXtreamUrl(base_url, username, password, 'streams');
        console.log(`🔍 Fetching streams from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Xtream API error: ${response.status} ${response.statusText}`);
        }
        
        let streams = await response.json();
        console.log(`📺 Found ${streams?.length || 0} total streams`);
        
        // Filter by category if specified
        if (categoryId && categoryId !== 'all') {
          streams = streams.filter((stream: any) => 
            stream.category_id === categoryId || stream.category_id === parseInt(categoryId)
          );
          console.log(`🎯 Filtered to ${streams.length} streams for category ${categoryId}`);
        }

        // Convert to our format and add stream URLs
        const formattedStreams = streams.map((stream: any) => ({
          id: `xtream-${providerId}-${stream.stream_id}`,
          name: stream.name,
          logo: stream.stream_icon || '',
          group: stream.category_name || 'Live TV',
          country: stream.country || '',
          language: stream.language || 'Unknown',
          url: getStreamUrl(base_url, username, password, stream.stream_id),
          stream_id: stream.stream_id,
          category_id: stream.category_id,
          epg_channel_id: stream.epg_channel_id || null,
          added: stream.added || null,
          is_adult: stream.is_adult || '0'
        }));

        console.log(`✅ Formatted ${formattedStreams.length} streams`);
        
        return new Response(JSON.stringify(formattedStreams), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'stream_url': {
        if (!streamId) {
          throw new Error('Stream ID is required');
        }

        const streamUrl = getStreamUrl(base_url, username, password, streamId);
        console.log(`🎬 Generated stream URL for ${streamId}: ${streamUrl}`);
        
        return new Response(JSON.stringify({ url: streamUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'account_info': {
        const apiUrl = getXtreamUrl(base_url, username, password, 'account_info');
        console.log(`👤 Fetching account info from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Xtream API error: ${response.status} ${response.statusText}`);
        }
        
        const accountInfo = await response.json();
        console.log(`✅ Account info retrieved for user: ${accountInfo.user_info?.username || 'unknown'}`);
        
        return new Response(JSON.stringify(accountInfo), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Xtream Proxy error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});