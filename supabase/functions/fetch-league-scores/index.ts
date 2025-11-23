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
    const { sportKey } = await req.json();
    console.log(`Fetching recent scores for sport: ${sportKey}`);

    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      throw new Error('ODDS_API_KEY not configured');
    }
    
    // Fetch recent scores (last 3 days)
    const daysFrom = 3;
    const scoresUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/scores?apiKey=${apiKey}&daysFrom=${daysFrom}`;
    console.log(`Calling API: ${scoresUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const scoresResponse = await fetch(scoresUrl);
    
    if (!scoresResponse.ok) {
      const errorText = await scoresResponse.text();
      console.error(`API Error (${scoresResponse.status}):`, errorText);
      
      // Handle quota exceeded gracefully
      if (scoresResponse.status === 401 || scoresResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'API quota exceeded',
            quotaExceeded: true,
            scores: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`API returned ${scoresResponse.status}: ${errorText.substring(0, 200)}`);
    }
    
    const contentType = scoresResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await scoresResponse.text();
      console.error('Non-JSON response:', responseText.substring(0, 500));
      throw new Error(`API returned non-JSON response (${contentType})`);
    }
    
    const scoresData = await scoresResponse.json();

    if (!scoresData || scoresData.length === 0) {
      console.log('No recent scores found');
      return new Response(
        JSON.stringify({ success: true, message: 'No recent scores', scores: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter completed matches and transform
    const scores = scoresData
      .filter((event: any) => event.completed)
      .map((event: any) => ({
        match_id: event.id,
        home_team: event.home_team,
        away_team: event.away_team,
        home_score: event.scores?.find((s: any) => s.name === event.home_team)?.score || 0,
        away_score: event.scores?.find((s: any) => s.name === event.away_team)?.score || 0,
        commence_time: event.commence_time,
        completed: event.completed,
        sport_key: event.sport_key,
        sport_title: event.sport_title
      }));

    console.log(`Successfully fetched ${scores.length} recent scores`);

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