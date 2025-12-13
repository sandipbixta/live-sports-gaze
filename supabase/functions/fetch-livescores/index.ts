import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the v1 API with free tier (100 requests/min)
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/751945';

// Sport mapping for TheSportsDB API
const sportApiMap: Record<string, string> = {
  'football': 'Soccer',
  'soccer': 'Soccer',
  'basketball': 'Basketball',
  'nba': 'Basketball', 
  'hockey': 'Ice Hockey',
  'ice hockey': 'Ice Hockey',
  'nhl': 'Ice Hockey',
  'nfl': 'American Football',
  'american football': 'American Football',
  'baseball': 'Baseball',
  'mlb': 'Baseball',
  'rugby': 'Rugby',
  'mma': 'Fighting',
  'ufc': 'Fighting',
  'boxing': 'Fighting',
  'cricket': 'Cricket',
  'tennis': 'Tennis',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sport } = await req.json();
    const sportKey = (sport || 'soccer').toLowerCase();
    const sportsDbSport = sportApiMap[sportKey] || 'Soccer';
    
    console.log(`Fetching live scores for sport: ${sportKey} -> ${sportsDbSport}`);

    // Use the livescore endpoint which shows today's events with scores
    const response = await fetch(`${SPORTSDB_API}/eventsday.php?d=${new Date().toISOString().split('T')[0]}&s=${encodeURIComponent(sportsDbSport)}`, {
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      console.error('TheSportsDB API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ livescores: [], error: `API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const data = await response.json();
    const events = data.events || [];
    
    // Transform events to live score format
    const livescores = events.map((event: any) => ({
      idEvent: event.idEvent,
      strEvent: event.strEvent,
      strHomeTeam: event.strHomeTeam,
      strAwayTeam: event.strAwayTeam,
      intHomeScore: event.intHomeScore,
      intAwayScore: event.intAwayScore,
      strStatus: event.strStatus,
      strProgress: event.strProgress || event.strStatus,
      strTimestamp: event.strTimestamp,
      dateEvent: event.dateEvent,
      strTime: event.strTime,
    })).filter((event: any) => {
      // Filter for events that are live or recently started
      const status = (event.strStatus || '').toLowerCase();
      return status.includes('live') || 
             status.includes('progress') || 
             status.includes('1h') || 
             status.includes('2h') ||
             status.includes('ht') ||
             event.intHomeScore !== null ||
             event.intAwayScore !== null;
    });
    
    console.log(`Found ${livescores.length} live/recent events for ${sportsDbSport}`);

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