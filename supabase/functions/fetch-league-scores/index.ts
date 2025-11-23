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
    const { competitionCode } = await req.json();
    console.log(`Fetching recent scores for competition: ${competitionCode}`);

    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }
    
    // Fetch recent finished matches for the competition
    const scoresUrl = `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=FINISHED`;
    console.log(`Calling football-data.org API for ${competitionCode}`);
    
    const scoresResponse = await fetch(scoresUrl, {
      headers: {
        'X-Auth-Token': apiKey
      }
    });
    
    if (!scoresResponse.ok) {
      const errorText = await scoresResponse.text();
      console.error(`API Error (${scoresResponse.status}):`, errorText);
      
      // Handle quota/rate limit errors gracefully
      if (scoresResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'API rate limit reached',
            quotaExceeded: true,
            scores: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`API returned ${scoresResponse.status}: ${errorText.substring(0, 200)}`);
    }
    
    const data = await scoresResponse.json();

    if (!data.matches || data.matches.length === 0) {
      console.log('No recent scores found');
      return new Response(
        JSON.stringify({ success: true, message: 'No recent scores', scores: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to our format and get last 10 matches
    const scores = data.matches
      .slice(-10)
      .reverse()
      .map((match: any) => ({
        match_id: match.id.toString(),
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
        home_score: match.score.fullTime.home || 0,
        away_score: match.score.fullTime.away || 0,
        commence_time: match.utcDate,
        completed: match.status === 'FINISHED',
        sport_key: competitionCode,
        sport_title: match.competition.name
      }));

    console.log(`Successfully fetched ${scores.length} recent scores from ${data.competition.name}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        count: scores.length,
        scores 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-league-scores function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});