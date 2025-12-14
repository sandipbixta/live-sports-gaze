import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map sport keys to TheSportsDB league IDs
const LEAGUE_MAPPINGS: Record<string, { leagueId: string; sport: string }> = {
  'soccer_epl': { leagueId: '4328', sport: 'Soccer' },
  'soccer_spain_la_liga': { leagueId: '4335', sport: 'Soccer' },
  'soccer_germany_bundesliga': { leagueId: '4331', sport: 'Soccer' },
  'soccer_italy_serie_a': { leagueId: '4332', sport: 'Soccer' },
  'soccer_france_ligue_one': { leagueId: '4334', sport: 'Soccer' },
  'soccer_uefa_champs_league': { leagueId: '4480', sport: 'Soccer' },
  'soccer_usa_mls': { leagueId: '4346', sport: 'Soccer' },
  'soccer_netherlands_eredivisie': { leagueId: '4344', sport: 'Soccer' },
  'soccer_portugal_primeira_liga': { leagueId: '4358', sport: 'Soccer' },
  'soccer_brazil_serie_a': { leagueId: '4351', sport: 'Soccer' },
  'soccer_argentina_primera': { leagueId: '4406', sport: 'Soccer' },
  'basketball_nba': { leagueId: '4387', sport: 'Basketball' },
  'americanfootball_nfl': { leagueId: '4391', sport: 'American Football' },
  'icehockey_nhl': { leagueId: '4380', sport: 'Ice Hockey' },
  'baseball_mlb': { leagueId: '4424', sport: 'Baseball' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sportKey } = await req.json();
    
    console.log(`Fetching teams for sport: ${sportKey}`);

    const leagueMapping = LEAGUE_MAPPINGS[sportKey];
    
    if (!leagueMapping) {
      console.log(`No league mapping found for: ${sportKey}, trying to search...`);
      // Return empty but successful response for unmapped leagues
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `No predefined mapping for ${sportKey}`,
          count: 0,
          teams: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use TheSportsDB API (free tier with API key 3)
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/lookup_all_teams.php?id=${leagueMapping.leagueId}`;
    console.log(`Calling TheSportsDB API for league ID: ${leagueMapping.leagueId}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TheSportsDB API Error (${response.status}):`, errorText);
      throw new Error(`TheSportsDB API returned ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.teams || data.teams.length === 0) {
      console.log(`No teams found for league: ${sportKey}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No teams found for this league', count: 0, teams: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform teams data
    const teams = data.teams.map((team: any) => ({
      team_id: `${sportKey}_${team.idTeam}`,
      team_name: team.strTeam,
      league_name: sportKey,
      sport: leagueMapping.sport,
      logo_url: team.strBadge || team.strLogo || null,
      stadium: team.strStadium || null,
      description: team.strDescriptionEN ? team.strDescriptionEN.substring(0, 1000) : null,
      year_founded: team.intFormedYear ? parseInt(team.intFormedYear) : null,
      country: team.strCountry || null,
      website: team.strWebsite || null,
    }));

    console.log(`Found ${teams.length} teams from TheSportsDB`);

    // Upsert teams into database
    const { data: upsertedData, error } = await supabase
      .from('league_teams')
      .upsert(teams, { onConflict: 'team_id' })
      .select();

    if (error) {
      console.error('Error upserting teams:', error);
      throw error;
    }

    console.log(`Successfully stored ${teams.length} teams`);

    return new Response(
      JSON.stringify({ 
        success: true,
        count: teams.length,
        teams: upsertedData 
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
