import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days - competitions don't change often

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY not configured');
    }

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached competitions data');
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching competitions from Football-Data.org');

    const response = await fetch(
      'https://api.football-data.org/v4/competitions',
      {
        headers: {
          'X-Auth-Token': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Football-Data.org API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format competitions data
    const competitions = data.competitions
      .filter((comp: any) => comp.emblem) // Only include competitions with logos
      .map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        code: comp.code,
        type: comp.type,
        emblem: comp.emblem,
        area: {
          name: comp.area.name,
          code: comp.area.code,
          flag: comp.area.flag,
        },
        currentSeason: comp.currentSeason ? {
          startDate: comp.currentSeason.startDate,
          endDate: comp.currentSeason.endDate,
          currentMatchday: comp.currentSeason.currentMatchday,
        } : null,
      }));

    // Update cache
    cachedData = competitions;
    cacheTimestamp = now;

    console.log(`Successfully fetched ${competitions.length} competitions`);

    return new Response(JSON.stringify(competitions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching competitions:', error);
    
    // If rate limited (429) or any error, return fallback data
    const fallbackCompetitions = [
      {
        id: 2021,
        name: "Premier League",
        code: "PL",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/PL.png",
        area: { name: "England", code: "ENG", flag: "https://crests.football-data.org/770.svg" },
        currentSeason: { startDate: "2024-08-16", endDate: "2025-05-25", currentMatchday: 15 }
      },
      {
        id: 2014,
        name: "Primera Division",
        code: "PD",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/PD.png",
        area: { name: "Spain", code: "ESP", flag: "https://crests.football-data.org/760.svg" },
        currentSeason: { startDate: "2024-08-15", endDate: "2025-05-25", currentMatchday: 15 }
      },
      {
        id: 2019,
        name: "Serie A",
        code: "SA",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/SA.png",
        area: { name: "Italy", code: "ITA", flag: "https://crests.football-data.org/784.svg" },
        currentSeason: { startDate: "2024-08-17", endDate: "2025-05-25", currentMatchday: 15 }
      },
      {
        id: 2002,
        name: "Bundesliga",
        code: "BL1",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/BL1.png",
        area: { name: "Germany", code: "DEU", flag: "https://crests.football-data.org/759.svg" },
        currentSeason: { startDate: "2024-08-23", endDate: "2025-05-17", currentMatchday: 15 }
      },
      {
        id: 2015,
        name: "Ligue 1",
        code: "FL1",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/FL1.png",
        area: { name: "France", code: "FRA", flag: "https://crests.football-data.org/773.svg" },
        currentSeason: { startDate: "2024-08-16", endDate: "2025-05-18", currentMatchday: 15 }
      },
      {
        id: 2001,
        name: "UEFA Champions League",
        code: "CL",
        type: "CUP",
        emblem: "https://crests.football-data.org/CL.png",
        area: { name: "Europe", code: "EUR", flag: "https://crests.football-data.org/EUR.svg" },
        currentSeason: { startDate: "2024-09-17", endDate: "2025-05-31", currentMatchday: 6 }
      },
      {
        id: 2018,
        name: "European Championship",
        code: "EC",
        type: "CUP",
        emblem: "https://crests.football-data.org/EC.png",
        area: { name: "Europe", code: "EUR", flag: "https://crests.football-data.org/EUR.svg" },
        currentSeason: null
      },
      {
        id: 2016,
        name: "Championship",
        code: "ELC",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/ELC.png",
        area: { name: "England", code: "ENG", flag: "https://crests.football-data.org/770.svg" },
        currentSeason: { startDate: "2024-08-09", endDate: "2025-05-03", currentMatchday: 20 }
      },
      {
        id: 2003,
        name: "Eredivisie",
        code: "DED",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/DED.png",
        area: { name: "Netherlands", code: "NLD", flag: "https://crests.football-data.org/5.svg" },
        currentSeason: { startDate: "2024-08-09", endDate: "2025-05-18", currentMatchday: 15 }
      },
      {
        id: 2017,
        name: "Primeira Liga",
        code: "PPL",
        type: "LEAGUE",
        emblem: "https://crests.football-data.org/PPL.png",
        area: { name: "Portugal", code: "PRT", flag: "https://crests.football-data.org/765.svg" },
        currentSeason: { startDate: "2024-08-09", endDate: "2025-05-18", currentMatchday: 15 }
      }
    ];

    console.log('Returning fallback competitions due to API error');
    
    // Cache the fallback data
    cachedData = fallbackCompetitions;
    cacheTimestamp = Date.now();

    return new Response(JSON.stringify(fallbackCompetitions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
