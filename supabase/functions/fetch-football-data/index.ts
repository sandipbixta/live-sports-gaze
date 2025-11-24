import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache with separate entries for each endpoint
const cache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for most endpoints
const LIVE_CACHE_DURATION = 30 * 1000; // 30 seconds for live matches

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }

    const { endpoint, competitionId } = await req.json();
    const cacheKey = `${endpoint}-${competitionId || 'all'}`;
    
    // Check cache
    const now = Date.now();
    const cached = cache.get(cacheKey);
    const cacheDuration = endpoint === 'live' ? LIVE_CACHE_DURATION : CACHE_DURATION;
    
    if (cached && (now - cached.timestamp) < cacheDuration) {
      console.log(`Returning cached data for ${cacheKey}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching fresh data for ${endpoint}`);

    let url = '';
    let data: any;

    switch (endpoint) {
      case 'live': {
        // Fetch live matches
        url = 'https://api.football-data.org/v4/matches?status=IN_PLAY';
        const response = await fetch(url, {
          headers: { 'X-Auth-Token': apiKey },
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();
        
        data = json.matches.slice(0, 15).map((match: any) => ({
          id: match.id,
          homeTeam: {
            name: match.homeTeam.name,
            shortName: match.homeTeam.shortName,
            logo: match.homeTeam.crest || null,
          },
          awayTeam: {
            name: match.awayTeam.name,
            shortName: match.awayTeam.shortName,
            logo: match.awayTeam.crest || null,
          },
          score: {
            home: match.score.fullTime.home || 0,
            away: match.score.fullTime.away || 0,
          },
          competition: {
            id: match.competition.id,
            name: match.competition.name,
            code: match.competition.code,
            logo: match.competition.emblem || null,
          },
          utcDate: match.utcDate,
          status: 'LIVE',
          minute: match.minute,
        }));
        break;
      }

      case 'upcoming': {
        // Fetch upcoming matches (next 7 days)
        const today = new Date();
        const dateFrom = today.toISOString().split('T')[0];
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dateTo = nextWeek.toISOString().split('T')[0];
        
        url = `https://api.football-data.org/v4/matches?status=SCHEDULED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const response = await fetch(url, {
          headers: { 'X-Auth-Token': apiKey },
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();
        
        data = json.matches.slice(0, 20).map((match: any) => ({
          id: match.id,
          homeTeam: {
            name: match.homeTeam.name,
            shortName: match.homeTeam.shortName,
            logo: match.homeTeam.crest || null,
          },
          awayTeam: {
            name: match.awayTeam.name,
            shortName: match.awayTeam.shortName,
            logo: match.awayTeam.crest || null,
          },
          score: {
            home: null,
            away: null,
          },
          competition: {
            id: match.competition.id,
            name: match.competition.name,
            code: match.competition.code,
            logo: match.competition.emblem || null,
          },
          utcDate: match.utcDate,
          status: 'SCHEDULED',
        }));
        break;
      }

      case 'standings': {
        if (!competitionId) throw new Error('Competition ID required for standings');
        url = `https://api.football-data.org/v4/competitions/${competitionId}/standings`;
        const response = await fetch(url, {
          headers: { 'X-Auth-Token': apiKey },
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        data = await response.json();
        break;
      }

      case 'scorers': {
        if (!competitionId) throw new Error('Competition ID required for scorers');
        url = `https://api.football-data.org/v4/competitions/${competitionId}/scorers`;
        const response = await fetch(url, {
          headers: { 'X-Auth-Token': apiKey },
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        data = await response.json();
        break;
      }

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    // Update cache
    cache.set(cacheKey, { data, timestamp: now });

    console.log(`Successfully fetched ${endpoint} data`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching football data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
