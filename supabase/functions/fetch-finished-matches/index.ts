import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Helper function to fetch with retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      // If server error (5xx), retry
      if (response.status >= 500 && i < retries) {
        console.log(`API returned ${response.status}, retrying (${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      // For other errors, throw immediately
      throw new Error(`Football-Data.org API error: ${response.status}`);
    } catch (error) {
      lastError = error;
      if (i < retries) {
        console.log(`Fetch failed, retrying (${i + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }

    // Check if cache is valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached finished matches data');
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching fresh finished matches data from Football-Data.org');

    // Fetch finished matches from the last 7 days for more results
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const dateFrom = weekAgo.toISOString().split('T')[0];
    
    const today = new Date();
    const dateTo = today.toISOString().split('T')[0];

    try {
      const response = await fetchWithRetry(
        `https://api.football-data.org/v4/matches?status=FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            'X-Auth-Token': apiKey,
          },
        }
      );

      const data = await response.json();
      
      // Filter and format the matches
      const formattedMatches = data.matches
        .filter((match: any) => match.score.fullTime.home !== null && match.score.fullTime.away !== null)
        .slice(0, 20) // Limit to 20 most recent matches
        .map((match: any) => ({
          id: match.id,
          homeTeam: {
            name: match.homeTeam.name,
            logo: match.homeTeam.crest || null,
          },
          awayTeam: {
            name: match.awayTeam.name,
            logo: match.awayTeam.crest || null,
          },
          score: {
            home: match.score.fullTime.home,
            away: match.score.fullTime.away,
          },
          competition: {
            id: match.competition.id,
            name: match.competition.name,
            logo: match.competition.emblem || null,
          },
          utcDate: match.utcDate,
        }));

      // Update cache
      cachedData = formattedMatches;
      cacheTimestamp = now;

      console.log(`Successfully fetched ${formattedMatches.length} finished matches`);

      return new Response(JSON.stringify(formattedMatches), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      // If API fails but we have stale cache, return it
      if (cachedData) {
        console.log('API failed, returning stale cached data');
        return new Response(JSON.stringify(cachedData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error fetching finished matches:', error);
    return new Response(
      JSON.stringify({ error: error.message, matches: [] }),
      {
        status: 200, // Return 200 with empty array to prevent UI breaks
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
