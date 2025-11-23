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
    const { leagueName } = await req.json();
    
    console.log(`Fetching teams for league: ${leagueName}`);

    const apiKey = Deno.env.get('THESPORTSDB_API_KEY') || '3';
    
    // Fetch all teams in the league
    const teamsUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`;
    const teamsResponse = await fetch(teamsUrl);
    const teamsData = await teamsResponse.json();

    if (!teamsData.teams || teamsData.teams.length === 0) {
      console.log(`No teams found for league: ${leagueName}`);
      return new Response(
        JSON.stringify({ success: false, message: 'No teams found', teams: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const teams = teamsData.teams.map((team: any) => ({
      team_id: team.idTeam,
      team_name: team.strTeam,
      league_name: leagueName,
      sport: team.strSport?.toLowerCase() || 'unknown',
      logo_url: team.strTeamBadge || null,
      stadium: team.strStadium || null,
      description: team.strDescriptionEN || null,
      year_founded: team.intFormedYear || null,
      country: team.strCountry || null,
      website: team.strWebsite || null,
    }));

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
