import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTSDB_API_V1 = 'https://www.thesportsdb.com/api/v1/json/751945';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teamName, type } = await req.json();
    
    if (!teamName) {
      return new Response(
        JSON.stringify({ error: 'Team name required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching team data for: ${teamName}`);

    const endpoint = type === 'player' 
      ? `${SPORTSDB_API_V1}/searchplayers.php?p=${encodeURIComponent(teamName)}`
      : `${SPORTSDB_API_V1}/searchteams.php?t=${encodeURIComponent(teamName)}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      console.error('TheSportsDB API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ team: null, error: `API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const data = await response.json();
    
    if (type === 'player') {
      const player = data.player?.[0] || null;
      return new Response(
        JSON.stringify({ 
          player: player ? {
            thumb: player.strThumb || null,
            cutout: player.strCutout || null,
            render: player.strRender || null,
            banner: player.strBanner || null
          } : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const team = data.teams?.[0] || null;
    
    return new Response(
      JSON.stringify({ 
        team: team ? {
          badge: team.strBadge || null,
          logo: team.strLogo || null,
          banner: team.strBanner || null,
          jersey: team.strJersey || null
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching team data:', error);
    return new Response(
      JSON.stringify({ team: null, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});