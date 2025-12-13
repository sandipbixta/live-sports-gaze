import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTSDB_API_V2 = 'https://www.thesportsdb.com/api/v2/json';
const API_KEY = Deno.env.get('THESPORTSDB_API_KEY') || '751945';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sport } = await req.json();
    const sportKey = sport || 'soccer';
    
    console.log(`Fetching live scores for sport: ${sportKey}`);

    const response = await fetch(`${SPORTSDB_API_V2}/livescore/${sportKey}`, {
      headers: {
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      console.error('TheSportsDB API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ livescores: [], error: `API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const data = await response.json();
    const livescores = data.livescore || data.events || [];
    
    console.log(`Found ${livescores.length} live events for ${sportKey}`);

    return new Response(
      JSON.stringify({ livescores }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return new Response(
      JSON.stringify({ livescores: [], error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});