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

    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }

    // Fetch sports to find the right sport key
    const sportsUrl = `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`;
    const sportsResponse = await fetch(sportsUrl);
    const sportsData = await sportsResponse.json();

    // Find matching sport
    const matchingSport = sportsData.find((s: any) => 
      s.group.toLowerCase() === sport.toLowerCase() || 
      s.title.toLowerCase().includes(sport.toLowerCase())
    );

    if (!matchingSport) {
      console.log(`No matching sport found for: ${sport}`);
      return new Response(
        JSON.stringify({ success: false, message: 'Sport not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent events for this sport to get team stats
    const eventsUrl = `https://api.the-odds-api.com/v4/sports/${matchingSport.key}/scores?apiKey=${apiKey}&daysFrom=30`;
    const eventsResponse = await fetch(eventsUrl);
    const eventsData = await eventsResponse.json();

    // Filter events involving this team
    const teamEvents = eventsData.filter((event: any) => 
      event.home_team === teamName || event.away_team === teamName
    );

    // Calculate basic stats from recent matches
    let wins = 0, draws = 0, losses = 0;
    let goalsScored = 0, goalsConceded = 0;
    const form: string[] = [];

    teamEvents.forEach((event: any) => {
      if (event.scores) {
        const isHome = event.home_team === teamName;
        const teamScore = isHome ? event.scores[0]?.score : event.scores[1]?.score;
        const opponentScore = isHome ? event.scores[1]?.score : event.scores[0]?.score;

        if (teamScore !== undefined && opponentScore !== undefined) {
          goalsScored += teamScore;
          goalsConceded += opponentScore;

          if (teamScore > opponentScore) {
            wins++;
            form.push('W');
          } else if (teamScore < opponentScore) {
            losses++;
            form.push('L');
          } else {
            draws++;
            form.push('D');
          }
        }
      }
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare team stats
    const teamStats = {
      team_id: `${matchingSport.key}_${teamName.toLowerCase().replace(/\s+/g, '_')}`,
      team_name: teamName,
      sport: sport.toLowerCase(),
      league: matchingSport.title,
      matches_played: teamEvents.length,
      wins,
      draws,
      losses,
      goals_scored: goalsScored,
      goals_conceded: goalsConceded,
      clean_sheets: teamEvents.filter((e: any) => {
        const isHome = e.home_team === teamName;
        const opponentScore = isHome ? e.scores?.[1]?.score : e.scores?.[0]?.score;
        return opponentScore === 0;
      }).length,
      win_rate: teamEvents.length > 0 ? (wins / teamEvents.length) * 100 : 0,
      average_goals: teamEvents.length > 0 ? goalsScored / teamEvents.length : 0,
      current_position: null,
      total_points: (wins * 3) + draws,
      form_last_5: form.slice(-5),
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
        team: teamName,
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
