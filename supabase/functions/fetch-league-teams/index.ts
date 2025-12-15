import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback map for non-soccer leagues (or when league lookup fails)
const LEAGUE_MAPPINGS: Record<string, { leagueId: string; sport: string }> = {
  soccer_epl: { leagueId: "4328", sport: "Soccer" },
  soccer_spain_la_liga: { leagueId: "4335", sport: "Soccer" },
  soccer_germany_bundesliga: { leagueId: "4331", sport: "Soccer" },
  soccer_italy_serie_a: { leagueId: "4332", sport: "Soccer" },
  soccer_france_ligue_one: { leagueId: "4334", sport: "Soccer" },
  soccer_uefa_champs_league: { leagueId: "4480", sport: "Soccer" },
  soccer_usa_mls: { leagueId: "4346", sport: "Soccer" },
  soccer_netherlands_eredivisie: { leagueId: "4344", sport: "Soccer" },
  soccer_portugal_primeira_liga: { leagueId: "4358", sport: "Soccer" },
  soccer_brazil_serie_a: { leagueId: "4351", sport: "Soccer" },
  soccer_argentina_primera: { leagueId: "4406", sport: "Soccer" },
  basketball_nba: { leagueId: "4387", sport: "Basketball" },
  americanfootball_nfl: { leagueId: "4391", sport: "American Football" },
  icehockey_nhl: { leagueId: "4380", sport: "Ice Hockey" },
  baseball_mlb: { leagueId: "4424", sport: "Baseball" },
};

const normalizeSport = (sport: string) => sport.toLowerCase().replace(/\s+/g, "_");
const normalizeText = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

const getSportsDbLeaguesArray = (data: any): any[] => {
  if (!data) return [];
  return data.countrys ?? data.countries ?? data.leagues ?? [];
};

const ensureHttps = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

const countryAliasForSportsDb = (country: string | null) => {
  if (!country) return null;
  const c = country.trim();
  if (c.toLowerCase() === "usa") return "United States";
  // SportsDB doesn't always treat these as "countries" in the search endpoint
  if (["europe", "world", "south america", "north america", "international"].includes(c.toLowerCase())) {
    return null;
  }
  return c;
};

const resolveSportsDbLeagueId = async (leagueName: string, country: string | null) => {
  const countryParam = countryAliasForSportsDb(country);
  const url = countryParam
    ? `https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?s=Soccer&c=${encodeURIComponent(countryParam)}`
    : `https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?s=Soccer`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const leagues = getSportsDbLeaguesArray(data);

  const target = normalizeText(leagueName);
  const exact = leagues.find((l: any) => {
    const a = l?.strLeague ? normalizeText(String(l.strLeague)) : "";
    const b = l?.strLeagueAlternate ? normalizeText(String(l.strLeagueAlternate)) : "";
    return a === target || b === target;
  });
  if (exact?.idLeague) return String(exact.idLeague);

  const fuzzy = leagues.find((l: any) => {
    const a = l?.strLeague ? normalizeText(String(l.strLeague)) : "";
    const b = l?.strLeagueAlternate ? normalizeText(String(l.strLeagueAlternate)) : "";
    return a.includes(target) || target.includes(a) || b.includes(target) || target.includes(b);
  });
  if (fuzzy?.idLeague) return String(fuzzy.idLeague);

  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sportKey = typeof body?.sportKey === "string" ? body.sportKey : "";

    if (!sportKey) {
      return new Response(JSON.stringify({ error: "Missing sportKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching teams for league key: ${sportKey}`);

    // Initialize Supabase client (service role)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to resolve from DB league record first (best source of truth)
    const { data: leagueRow, error: leagueErr } = await supabase
      .from("leagues")
      .select("league_name,country,sport")
      .eq("league_id", sportKey)
      .maybeSingle();

    if (leagueErr) {
      console.warn("Could not read league row:", leagueErr);
    }

    const isSoccer = (leagueRow?.sport ?? "") === "soccer";

    // Resolve TheSportsDB leagueId dynamically to prevent mismatches
    let sportsDbLeagueId: string | null = null;
    if (leagueRow?.league_name && isSoccer) {
      sportsDbLeagueId = await resolveSportsDbLeagueId(leagueRow.league_name, leagueRow.country ?? null);
      console.log(`Resolved SportsDB leagueId for ${leagueRow.league_name}:`, sportsDbLeagueId);
    }

    // Fallback to hard mapping (mostly for non-soccer)
    if (!sportsDbLeagueId) {
      const mapping = LEAGUE_MAPPINGS[sportKey];
      if (mapping?.leagueId) {
        sportsDbLeagueId = mapping.leagueId;
        console.log(`Using fallback mapping for ${sportKey} -> ${sportsDbLeagueId}`);
      }
    }

    if (!sportsDbLeagueId) {
      console.log(`No leagueId resolved for: ${sportKey}`);
      return new Response(
        JSON.stringify({ success: true, message: `No league mapping for ${sportKey}`, count: 0, teams: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/lookup_all_teams.php?id=${sportsDbLeagueId}`;
    console.log(`Calling TheSportsDB teams API: ${apiUrl}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TheSportsDB API Error (${response.status}):`, errorText);
      throw new Error(`TheSportsDB API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data?.teams || data.teams.length === 0) {
      console.log(`No teams found for league key: ${sportKey}`);
      return new Response(
        JSON.stringify({ success: true, message: "No teams found for this league", count: 0, teams: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sportNormalized = normalizeSport(leagueRow?.sport ?? (LEAGUE_MAPPINGS[sportKey]?.sport ?? "soccer"));

    // Clear previous teams for this league key to avoid mixing clubs across leagues
    const { error: deleteError } = await supabase.from("league_teams").delete().eq("league_name", sportKey);
    if (deleteError) {
      console.warn("Could not delete old teams (continuing):", deleteError);
    }

    const teams = data.teams.map((team: any) => ({
      team_id: `${sportKey}_${team.idTeam}`,
      team_name: team.strTeam,
      league_name: sportKey,
      sport: sportNormalized,
      logo_url: team.strBadge || team.strLogo || null,
      stadium: team.strStadium || null,
      description: team.strDescriptionEN ? String(team.strDescriptionEN).substring(0, 1000) : null,
      year_founded: team.intFormedYear ? parseInt(team.intFormedYear) : null,
      country: team.strCountry || null,
      website: ensureHttps(team.strWebsite || null),
    }));

    console.log(`Found ${teams.length} teams from TheSportsDB`);

    const { data: upsertedData, error } = await supabase
      .from("league_teams")
      .upsert(teams, { onConflict: "team_id" })
      .select();

    if (error) {
      console.error("Error upserting teams:", error);
      throw error;
    }

    console.log(`Successfully stored ${teams.length} teams for ${sportKey}`);

    return new Response(
      JSON.stringify({ success: true, count: teams.length, teams: upsertedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-league-teams function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
