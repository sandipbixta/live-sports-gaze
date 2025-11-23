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
    console.log('Starting scheduled team stats update...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all unique team names from existing stats
    const { data: existingTeams, error: fetchError } = await supabase
      .from('team_stats')
      .select('team_name, sport');

    if (fetchError) {
      console.error('Error fetching teams:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${existingTeams?.length || 0} teams to update`);

    let updatedCount = 0;
    let failedCount = 0;

    // Update each team's stats
    for (const team of existingTeams || []) {
      try {
        console.log(`Updating stats for ${team.team_name} (${team.sport})`);
        
        const apiKey = Deno.env.get('THESPORTSDB_API_KEY') || '3';
        const searchUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodeURIComponent(team.team_name)}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.teams && searchData.teams.length > 0) {
          const teamData = searchData.teams[0];
          
          // Update team stats with fresh data
          const { error: updateError } = await supabase
            .from('team_stats')
            .update({
              team_id: teamData.idTeam,
              league: teamData.strLeague || null,
              updated_at: new Date().toISOString(),
            })
            .eq('team_name', team.team_name)
            .eq('sport', team.sport);

          if (updateError) {
            console.error(`Failed to update ${team.team_name}:`, updateError);
            failedCount++;
          } else {
            updatedCount++;
          }
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error updating ${team.team_name}:`, error);
        failedCount++;
      }
    }

    console.log(`Update complete: ${updatedCount} successful, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        updated: updatedCount,
        failed: failedCount,
        total: existingTeams?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scheduled stats update:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});