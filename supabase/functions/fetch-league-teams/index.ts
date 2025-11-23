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
    
    console.log(`Fetching teams for sport: ${sportKey}`);

    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }
    
    // Fetch events (matches) from The Odds API to extract team names
    const eventsUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${apiKey}&regions=us`;
    const eventsResponse = await fetch(eventsUrl);
    const eventsData = await eventsResponse.json();

    if (!eventsData || eventsData.length === 0) {
      console.log(`No events found for sport: ${sportKey}`);
      return new Response(
        JSON.stringify({ success: false, message: 'No events found', teams: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract unique teams from events
    const teamsMap = new Map();
    
    eventsData.forEach((event: any) => {
      // Add home team
      if (!teamsMap.has(event.home_team)) {
        teamsMap.set(event.home_team, {
          team_id: `${sportKey}_${event.home_team.toLowerCase().replace(/\s+/g, '_')}`,
          team_name: event.home_team,
          league_name: sportKey,
          sport: event.sport_key,
          logo_url: null,
          stadium: null,
          description: null,
          year_founded: null,
          country: null,
          website: null,
        });
      }
      
      // Add away team
      if (!teamsMap.has(event.away_team)) {
        teamsMap.set(event.away_team, {
          team_id: `${sportKey}_${event.away_team.toLowerCase().replace(/\s+/g, '_')}`,
          team_name: event.away_team,
          league_name: sportKey,
          sport: event.sport_key,
          logo_url: null,
          stadium: null,
          description: null,
          year_founded: null,
          country: null,
          website: null,
        });
      }
    });

    const teams = Array.from(teamsMap.values());

    // Upsert teams into database
    const { data, error } = await supabase
      .from('league_teams')
      .upsert(teams, { onConflict: 'team_id' })
      .select();

    if (error) {
      console.error('Error upserting teams:', error);
      throw error;
    }

    console.log(`Successfully fetched and stored ${teams.length} teams`);

    return new Response(
      JSON.stringify({ 
        success: true,
        count: teams.length,
        teams: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-league-teams function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
