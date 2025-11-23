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
    const { sport } = await req.json();
    
    console.log(`Fetching leagues for sport: ${sport}`);

    const apiKey = Deno.env.get('THESPORTSDB_API_KEY') || '3';
    
    // Fetch all leagues for the sport
    const leaguesUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/search_all_leagues.php?s=${encodeURIComponent(sport)}`;
    const leaguesResponse = await fetch(leaguesUrl);
    const leaguesData = await leaguesResponse.json();

    if (!leaguesData.countries || leaguesData.countries.length === 0) {
      console.log(`No leagues found for sport: ${sport}`);
      return new Response(
        JSON.stringify({ success: false, message: 'No leagues found', leagues: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const leagues = leaguesData.countries.map((league: any) => ({
      league_id: league.idLeague,
      league_name: league.strLeague,
      sport: sport.toLowerCase(),
      country: league.strCountry || null,
      logo_url: league.strBadge || null,
      description: league.strDescriptionEN || null,
      website: league.strWebsite || null,
      year_founded: league.intFormedYear || null,
    }));

    // Upsert leagues into database
    const { data, error } = await supabase
      .from('leagues')
      .upsert(leagues, { onConflict: 'league_id' })
      .select();

    if (error) {
      console.error('Error upserting leagues:', error);
      throw error;
    }

    console.log(`Successfully fetched and stored ${leagues.length} leagues`);

    return new Response(
      JSON.stringify({ 
        success: true,
        count: leagues.length,
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
