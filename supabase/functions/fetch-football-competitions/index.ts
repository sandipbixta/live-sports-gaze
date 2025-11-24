import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached competitions data');
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching competitions from Football-Data.org');

    const response = await fetch(
      'https://api.football-data.org/v4/competitions',
      {
        headers: {
          'X-Auth-Token': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Football-Data.org API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format competitions data
    const competitions = data.competitions
      .filter((comp: any) => comp.emblem) // Only include competitions with logos
      .map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        code: comp.code,
        type: comp.type,
        emblem: comp.emblem,
        area: {
          name: comp.area.name,
          code: comp.area.code,
          flag: comp.area.flag,
        },
        currentSeason: comp.currentSeason ? {
          startDate: comp.currentSeason.startDate,
          endDate: comp.currentSeason.endDate,
          currentMatchday: comp.currentSeason.currentMatchday,
        } : null,
      }));

    // Update cache
    cachedData = competitions;
    cacheTimestamp = now;

    console.log(`Successfully fetched ${competitions.length} competitions`);

    return new Response(JSON.stringify(competitions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching competitions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
