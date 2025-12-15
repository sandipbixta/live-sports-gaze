import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map internal league IDs to football-data.org competition codes
const LEAGUE_ID_TO_CODE: Record<string, string> = {
  soccer_england_premier_league: "PL",
  soccer_epl: "PL",
  soccer_spain_la_liga: "PD",
  soccer_germany_bundesliga: "BL1",
  soccer_italy_serie_a: "SA",
  soccer_france_ligue_1: "FL1",
  soccer_netherlands_eredivisie: "DED",
  soccer_portugal_primeira_liga: "PPL",
  soccer_brazil_serie_a: "BSA",
  soccer_england_championship: "ELC",
  soccer_uefa_champions_league: "CL",
  soccer_uefa_europa_league: "EL",
  soccer_fifa_world_cup: "WC",
  soccer_uefa_euro: "EC",

  // Direct codes also work
  PL: "PL",
  PD: "PD",
  BL1: "BL1",
  SA: "SA",
  FL1: "FL1",
  DED: "DED",
  PPL: "PPL",
  BSA: "BSA",
  ELC: "ELC",
  CL: "CL",
  EL: "EL",
  WC: "WC",
  EC: "EC",
};

const isCompetitionCode = (value: string) => /^[A-Z0-9]{2,4}$/.test(value);
const isCompetitionIdNumber = (value: string) => /^\d+$/.test(value);

// In-memory cache per competition
const cache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - longer cache to avoid rate limits

// Helper to fetch with retry on 429
async function fetchWithRetry(url: string, headers: Record<string, string>, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers });
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("Retry-After") || "30", 10);
      console.log(`Rate limited, waiting ${retryAfter}s before retry ${i + 1}/${retries}`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }
    return res;
  }
  // Last attempt
  return fetch(url, { headers });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");

    if (!apiKey) {
      throw new Error("FOOTBALL_DATA_API_KEY not configured");
    }

    const { competitionId } = await req.json();

    if (!competitionId) {
      return new Response(JSON.stringify({ error: "Competition ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawCompetitionId = String(competitionId);
    const competitionCode = LEAGUE_ID_TO_CODE[rawCompetitionId] || rawCompetitionId;

    console.log(`Mapping ${rawCompetitionId} -> ${competitionCode}`);

    // Avoid turning invalid IDs into 500s (e.g. "soccer_japan_j1" is not supported by football-data.org)
    const isValidForApi =
      isCompetitionCode(competitionCode) || isCompetitionIdNumber(competitionCode);

    if (!isValidForApi) {
      return new Response(
        JSON.stringify({
          error:
            `Unsupported competitionId: ${rawCompetitionId}. ` +
            `Use a football-data.org competition code like PL/PD/BL1/SA/FL1/CL/EC/WC.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cacheKey = `league-${competitionCode}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`Returning cached data for competition ${competitionCode}`);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching league detail for competition ${competitionCode}`);

    const authHeaders = { "X-Auth-Token": apiKey };

    // Fetch sequentially to avoid hitting rate limit with parallel requests
    const competitionRes = await fetchWithRetry(
      `https://api.football-data.org/v4/competitions/${competitionCode}`,
      authHeaders
    );

    if (!competitionRes.ok) {
      const errorText = await competitionRes.text();
      console.error(`Competition API error: ${competitionRes.status}`, errorText);
      
      // On rate limit, return a friendly message
      if (competitionRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in 30 seconds.", retryAfter: 30 }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Failed to fetch competition info: ${competitionRes.status} - ${errorText}` }),
        { status: competitionRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const standingsRes = await fetchWithRetry(
      `https://api.football-data.org/v4/competitions/${competitionCode}/standings`,
      authHeaders
    );

    const matchesRes = await fetchWithRetry(
      `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=SCHEDULED,FINISHED`,
      authHeaders
    );

    if (!standingsRes.ok) {
      const errorText = await standingsRes.text();
      console.error(`Standings API error: ${standingsRes.status}`, errorText);
      return new Response(
        JSON.stringify({
          error: `Failed to fetch standings: ${standingsRes.status} - ${errorText}`,
        }),
        {
          status: standingsRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!matchesRes.ok) {
      const errorText = await matchesRes.text();
      console.error(`Matches API error: ${matchesRes.status}`, errorText);
      return new Response(
        JSON.stringify({
          error: `Failed to fetch matches: ${matchesRes.status} - ${errorText}`,
        }),
        {
          status: matchesRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const [competitionData, standingsData, matchesData] = await Promise.all([
      competitionRes.json(),
      standingsRes.json(),
      matchesRes.json(),
    ]);

    console.log("Competition data fetched:", competitionData.name);
    console.log("Standings data:", standingsData.standings?.length || 0, "tables");
    console.log("Matches data:", matchesData.matches?.length || 0, "matches");

    // Extract standings (usually first table for league competitions)
    const standings = standingsData.standings?.[0]?.table || [];

    // Separate matches into upcoming and finished with proper date filtering
    const now_date = new Date();

    // Filter upcoming matches: must be in the future and scheduled
    const upcomingMatches = matchesData.matches
      .filter((m: any) => {
        if (m.status !== "SCHEDULED" && m.status !== "TIMED") return false;
        const matchDate = new Date(m.utcDate);
        return matchDate >= now_date; // Only future matches
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
      ) // Sort by date ascending
      .slice(0, 15)
      .map((m: any) => ({
        id: m.id,
        homeTeam: { name: m.homeTeam.name, crest: m.homeTeam.crest },
        awayTeam: { name: m.awayTeam.name, crest: m.awayTeam.crest },
        utcDate: m.utcDate,
        status: m.status,
        score: { home: null, away: null },
      }));

    // Filter finished matches: must be completed and recent
    const finishedMatches = matchesData.matches
      .filter((m: any) => {
        if (m.status !== "FINISHED") return false;
        const matchDate = new Date(m.utcDate);
        return matchDate <= now_date; // Only past matches
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
      ) // Sort by date descending (most recent first)
      .slice(0, 15)
      .map((m: any) => ({
        id: m.id,
        homeTeam: { name: m.homeTeam.name, crest: m.homeTeam.crest },
        awayTeam: { name: m.awayTeam.name, crest: m.awayTeam.crest },
        utcDate: m.utcDate,
        status: m.status,
        score: {
          home: m.score.fullTime.home,
          away: m.score.fullTime.away,
        },
      }));

    console.log(
      `Filtered ${upcomingMatches.length} upcoming matches and ${finishedMatches.length} finished matches`
    );

    const result = {
      competition: {
        id: competitionData.id,
        name: competitionData.name,
        emblem: competitionData.emblem,
        area: {
          name: competitionData.area.name,
          flag: competitionData.area.flag,
        },
      },
      standings: standings.map((s: any) => ({
        position: s.position,
        team: {
          name: s.team.name,
          crest: s.team.crest,
        },
        playedGames: s.playedGames,
        won: s.won,
        draw: s.draw,
        lost: s.lost,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
      })),
      upcomingMatches,
      finishedMatches,
    };

    // Update cache
    cache.set(cacheKey, { data: result, timestamp: now });

    console.log(`Successfully fetched league detail for ${competitionData.name}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching league detail:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
