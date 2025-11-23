import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teamName } = await req.json();
    
    console.log(`Fetching logo for team: ${teamName}`);

    // Use TheSportsDB free API (key "3" is for testing/free tier)
    const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
    console.log(`Calling TheSportsDB API: ${searchUrl}`);
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.teams || data.teams.length === 0) {
      console.log(`No team found for: ${teamName}`);
      return new Response(
        JSON.stringify({ success: false, message: 'Team not found', logo_url: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the first match
    const team = data.teams[0];
    const logoUrl = team.strBadge || team.strLogo || null;

    console.log(`Found logo for ${teamName}: ${logoUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        logo_url: logoUrl,
        team_info: {
          name: team.strTeam,
          stadium: team.strStadium,
          country: team.strCountry,
          year_founded: team.intFormedYear,
          description: team.strDescriptionEN
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching team logo:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});