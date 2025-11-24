import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache per competition
const cache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }

    const { competitionId } = await req.json();
    
    if (!competitionId) {
      throw new Error('Competition ID is required');
    }

    const cacheKey = `league-${competitionId}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Returning cached data for competition ${competitionId}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching league detail for competition ${competitionId}`);

    // Fetch competition info, standings, and matches in parallel
    const [competitionRes, standingsRes, matchesRes] = await Promise.all([
      fetch(`https://api.football-data.org/v4/competitions/${competitionId}`, {
        headers: { 'X-Auth-Token': apiKey },
      }),
      fetch(`https://api.football-data.org/v4/competitions/${competitionId}/standings`, {
        headers: { 'X-Auth-Token': apiKey },
      }),
      fetch(`https://api.football-data.org/v4/competitions/${competitionId}/matches?status=SCHEDULED,FINISHED`, {
        headers: { 'X-Auth-Token': apiKey },
      }),
    ]);

    if (!competitionRes.ok) {
      const errorText = await competitionRes.text();
      console.error(`Competition API error: ${competitionRes.status}`, errorText);
      throw new Error(`Failed to fetch competition info: ${competitionRes.status} - ${errorText}`);
    }

    if (!standingsRes.ok) {
      const errorText = await standingsRes.text();
      console.error(`Standings API error: ${standingsRes.status}`, errorText);
      throw new Error(`Failed to fetch standings: ${standingsRes.status} - ${errorText}`);
    }

    if (!matchesRes.ok) {
      const errorText = await matchesRes.text();
      console.error(`Matches API error: ${matchesRes.status}`, errorText);
      throw new Error(`Failed to fetch matches: ${matchesRes.status} - ${errorText}`);
    }

    const [competitionData, standingsData, matchesData] = await Promise.all([
      competitionRes.json(),
      standingsRes.json(),
      matchesRes.json(),
    ]);

    console.log('Competition data fetched:', competitionData.name);
    console.log('Standings data:', standingsData.standings?.length || 0, 'tables');
    console.log('Matches data:', matchesData.matches?.length || 0, 'matches');

    // Extract standings (usually first table for league competitions)
    const standings = standingsData.standings?.[0]?.table || [];

    // Separate matches into upcoming and finished
    const now_date = new Date();
    const upcomingMatches = matchesData.matches
      .filter((m: any) => m.status === 'SCHEDULED' || m.status === 'TIMED')
      .slice(0, 15)
      .map((m: any) => ({
        id: m.id,
        homeTeam: { name: m.homeTeam.name, crest: m.homeTeam.crest },
        awayTeam: { name: m.awayTeam.name, crest: m.awayTeam.crest },
        utcDate: m.utcDate,
        status: m.status,
        score: { home: null, away: null }
      }));

    const finishedMatches = matchesData.matches
      .filter((m: any) => m.status === 'FINISHED')
      .slice(0, 15)
      .map((m: any) => ({
        id: m.id,
        homeTeam: { name: m.homeTeam.name, crest: m.homeTeam.crest },
        awayTeam: { name: m.awayTeam.name, crest: m.awayTeam.crest },
        utcDate: m.utcDate,
        status: m.status,
        score: {
          home: m.score.fullTime.home,
          away: m.score.fullTime.away
        }
      }));

    const result = {
      competition: {
        id: competitionData.id,
        name: competitionData.name,
        emblem: competitionData.emblem,
        area: {
          name: competitionData.area.name,
          flag: competitionData.area.flag
        }
      },
      standings: standings.map((s: any) => ({
        position: s.position,
        team: {
          name: s.team.name,
          crest: s.team.crest
        },
        playedGames: s.playedGames,
        won: s.won,
        draw: s.draw,
        lost: s.lost,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference
      })),
      upcomingMatches,
      finishedMatches
    };

    // Update cache
    cache.set(cacheKey, { data: result, timestamp: now });

    console.log(`Successfully fetched league detail for ${competitionData.name}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching league detail:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
