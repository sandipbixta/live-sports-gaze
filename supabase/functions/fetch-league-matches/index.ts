import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sportKey } = await req.json();
    console.log(`Fetching matches for sport: ${sportKey}`);

    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }
    
    // Fetch upcoming events with odds
    const eventsUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${apiKey}&regions=us`;
    console.log(`Calling API: ${eventsUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const eventsResponse = await fetch(eventsUrl);
    
    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.error(`API Error (${eventsResponse.status}):`, errorText);
      throw new Error(`API returned ${eventsResponse.status}: ${errorText.substring(0, 200)}`);
    }
    
    const contentType = eventsResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await eventsResponse.text();
      console.error('Non-JSON response:', responseText.substring(0, 500));
      throw new Error(`API returned non-JSON response (${contentType})`);
    }
    
    const eventsData = await eventsResponse.json();

    if (!eventsData || eventsData.length === 0) {
      console.log('No upcoming matches found');
      return new Response(
        JSON.stringify({ success: true, message: 'No upcoming matches', matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform events into match format
    const matches = eventsData.map((event: any) => ({
      match_id: event.id,
      home_team: event.home_team,
      away_team: event.away_team,
      commence_time: event.commence_time,
      sport_key: event.sport_key,
      sport_title: event.sport_title,
      bookmakers: event.bookmakers?.slice(0, 3).map((bookmaker: any) => ({
        name: bookmaker.key,
        markets: bookmaker.markets?.[0]?.outcomes || []
      })) || []
    }));

    console.log(`Successfully fetched ${matches.length} upcoming matches`);

    return new Response(
      JSON.stringify({ 
        success: true,
        count: matches.length,
        matches 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-league-matches function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});