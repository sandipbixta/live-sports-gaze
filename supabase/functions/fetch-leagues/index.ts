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
    console.log('Fetching all sports from The Odds API');

    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }
    
    // Fetch all sports from The Odds API
    const sportsUrl = `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`;
    console.log(`Calling API: ${sportsUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const sportsResponse = await fetch(sportsUrl);
    
    // Check if response is OK
    if (!sportsResponse.ok) {
      const errorText = await sportsResponse.text();
      console.error(`API Error (${sportsResponse.status}):`, errorText);
      throw new Error(`API returned ${sportsResponse.status}: ${errorText.substring(0, 200)}`);
    }
    
    // Check content type before parsing JSON
    const contentType = sportsResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await sportsResponse.text();
      console.error('Non-JSON response:', responseText.substring(0, 500));
      throw new Error(`API returned non-JSON response (${contentType})`);
    }
    
    const sportsData = await sportsResponse.json();

    if (!sportsData || sportsData.length === 0) {
      console.log('No sports found');
      return new Response(
        JSON.stringify({ success: false, message: 'No sports found', leagues: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform sports into leagues format
    const leagues = sportsData
      .filter((sport: any) => sport.active) // Only active sports
      .map((sport: any) => ({
        league_id: sport.key,
        league_name: sport.title,
        sport: sport.group.toLowerCase().replace(/\s+/g, '_'),
        country: null, // The Odds API doesn't provide country info
        logo_url: null, // The Odds API doesn't provide logos
        description: sport.description,
        website: null,
        year_founded: null,
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
