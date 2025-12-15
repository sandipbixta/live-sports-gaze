import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Popular football leagues from TheSportsDB with their IDs
const FOOTBALL_LEAGUES = [
  // Top European Leagues
  { id: '4328', name: 'English Premier League', country: 'England', sportKey: 'soccer_epl' },
  { id: '4335', name: 'Spanish La Liga', country: 'Spain', sportKey: 'soccer_spain_la_liga' },
  { id: '4331', name: 'German Bundesliga', country: 'Germany', sportKey: 'soccer_germany_bundesliga' },
  { id: '4332', name: 'Italian Serie A', country: 'Italy', sportKey: 'soccer_italy_serie_a' },
  { id: '4334', name: 'French Ligue 1', country: 'France', sportKey: 'soccer_france_ligue_one' },
  
  // European Competitions
  { id: '4480', name: 'UEFA Champions League', country: 'Europe', sportKey: 'soccer_uefa_champs_league' },
  { id: '4481', name: 'UEFA Europa League', country: 'Europe', sportKey: 'soccer_uefa_europa_league' },
  { id: '5149', name: 'UEFA Conference League', country: 'Europe', sportKey: 'soccer_uefa_conference_league' },
  
  // Other Major European Leagues
  { id: '4344', name: 'Dutch Eredivisie', country: 'Netherlands', sportKey: 'soccer_netherlands_eredivisie' },
  { id: '4358', name: 'Portuguese Primeira Liga', country: 'Portugal', sportKey: 'soccer_portugal_primeira_liga' },
  { id: '4359', name: 'Scottish Premiership', country: 'Scotland', sportKey: 'soccer_scotland_premiership' },
  { id: '4355', name: 'Belgian Pro League', country: 'Belgium', sportKey: 'soccer_belgium_first_div' },
  { id: '4330', name: 'English Championship', country: 'England', sportKey: 'soccer_efl_champ' },
  { id: '4346', name: 'American MLS', country: 'USA', sportKey: 'soccer_usa_mls' },
  
  // South American
  { id: '4351', name: 'Brazilian Serie A', country: 'Brazil', sportKey: 'soccer_brazil_serie_a' },
  { id: '4406', name: 'Argentine Primera División', country: 'Argentina', sportKey: 'soccer_argentina_primera' },
  { id: '4350', name: 'Copa Libertadores', country: 'South America', sportKey: 'soccer_copa_libertadores' },
  
  // International
  { id: '4429', name: 'FIFA World Cup', country: 'World', sportKey: 'soccer_fifa_world_cup' },
  { id: '4424', name: 'UEFA Euro Championship', country: 'Europe', sportKey: 'soccer_uefa_euro' },
  { id: '4497', name: 'Copa America', country: 'South America', sportKey: 'soccer_copa_america' },
  { id: '4502', name: 'Africa Cup of Nations', country: 'Africa', sportKey: 'soccer_africa_cup' },
  
  // Asian Leagues
  { id: '4356', name: 'Saudi Pro League', country: 'Saudi Arabia', sportKey: 'soccer_saudi_pro_league' },
  { id: '4397', name: 'J1 League', country: 'Japan', sportKey: 'soccer_japan_j1' },
  { id: '4396', name: 'K League 1', country: 'South Korea', sportKey: 'soccer_korea_k1' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching football leagues from TheSportsDB...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete existing soccer leagues to refresh with correct data
    const { error: deleteError } = await supabase
      .from('leagues')
      .delete()
      .eq('sport', 'soccer');

    if (deleteError) {
      console.error('Error deleting old leagues:', deleteError);
    }

    // Fetch league details from TheSportsDB one by one to avoid mixing data
    const leaguesWithLogos = [];
    
    for (const league of FOOTBALL_LEAGUES) {
      try {
        const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${league.id}`;
        console.log(`Fetching league ${league.name} (${league.id})...`);
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.leagues && data.leagues[0]) {
            const leagueData = data.leagues[0];
            
            // Ensure website has protocol
            let website = leagueData.strWebsite || null;
            if (website && !website.startsWith('http')) {
              website = 'https://' + website;
            }
            
            leaguesWithLogos.push({
              league_id: league.sportKey,
              league_name: leagueData.strLeague || league.name,
              sport: 'soccer',
              country: leagueData.strCountry || league.country,
              logo_url: leagueData.strBadge || leagueData.strLogo || null,
              description: leagueData.strDescriptionEN ? leagueData.strDescriptionEN.substring(0, 500) : null,
              website: website,
              year_founded: leagueData.intFormedYear ? parseInt(leagueData.intFormedYear) : null,
            });
            
            console.log(`✓ Fetched: ${leagueData.strLeague} -> ${league.sportKey}`);
          } else {
            // Fallback if API returns empty
            leaguesWithLogos.push({
              league_id: league.sportKey,
              league_name: league.name,
              sport: 'soccer',
              country: league.country,
              logo_url: null,
              description: null,
              website: null,
              year_founded: null,
            });
            console.log(`✗ No data for ${league.name}, using fallback`);
          }
        } else {
          // Fallback on API error
          leaguesWithLogos.push({
            league_id: league.sportKey,
            league_name: league.name,
            sport: 'soccer',
            country: league.country,
            logo_url: null,
            description: null,
            website: null,
            year_founded: null,
          });
          console.log(`✗ API error for ${league.name}, using fallback`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching league ${league.name}:`, error);
        // Fallback to basic info if API fails
        leaguesWithLogos.push({
          league_id: league.sportKey,
          league_name: league.name,
          sport: 'soccer',
          country: league.country,
          logo_url: null,
          description: null,
          website: null,
          year_founded: null,
        });
      }
    }

    console.log(`Fetched ${leaguesWithLogos.length} leagues from TheSportsDB`);

    // Insert leagues into database
    const { data, error } = await supabase
      .from('leagues')
      .insert(leaguesWithLogos)
      .select();

    if (error) {
      console.error('Error inserting leagues:', error);
      throw error;
    }

    console.log(`Successfully stored ${leaguesWithLogos.length} football leagues`);

    return new Response(
      JSON.stringify({ 
        success: true,
        count: leaguesWithLogos.length,
        leagues: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-leagues function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
