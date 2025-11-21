import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_SPORTS_BASE_URL = 'https://v3.football.api-sports.io';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();
    
    console.log(`Fetching from API-Sports: ${endpoint}`);
    
    const API_KEY = Deno.env.get('API_SPORTS_KEY');
    if (!API_KEY) {
      throw new Error('API_SPORTS_KEY is not configured');
    }

    // Build URL with query parameters
    const url = new URL(`${API_SPORTS_BASE_URL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    console.log(`Making request to: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API-Sports error: ${response.status} - ${errorText}`);
      throw new Error(`API-Sports request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API-Sports response:`, data);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in api-sports function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
