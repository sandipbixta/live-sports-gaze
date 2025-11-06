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
    const { teamName, sport } = await req.json();
    
    console.log(`Fetching stats for team: ${teamName}, sport: ${sport}`);

    // Search for team on TheSportsDB (free API, no key needed)
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.teams || searchData.teams.length === 0) {
      console.log(`No team found for: ${teamName}`);
      return new Response(
        JSON.stringify({ success: false, message: 'Team not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const team = searchData.teams[0];
    console.log(`Found team: ${team.strTeam}, ID: ${team.idTeam}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare team stats data
    const teamStats = {
      team_id: team.idTeam,
      team_name: team.strTeam,
      sport: sport.toLowerCase(),
      league: team.strLeague || null,
      // These are mock stats since TheSportsDB free tier doesn't provide detailed stats
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      clean_sheets: 0,
      win_rate: 0,
      average_goals: 0,
      current_position: null,
      total_points: 0,
      form_last_5: [],
    };

    // Upsert team stats
    const { data, error } = await supabase
      .from('team_stats')
      .upsert(teamStats, { onConflict: 'team_id,sport' })
      .select();

    if (error) {
      console.error('Error upserting team stats:', error);
      throw error;
    }

    console.log('Team stats saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        team: team.strTeam,
        stats: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-team-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});