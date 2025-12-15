import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOOTBALL_DATA_SPORT_KEY = "football_data";

// Football-data.org competition codes
// Free tier supports: PL, BL1, SA, PD, FL1, ELC, PPL, DED, BSA, CL, EC, WC
const FOOTBALL_DATA_COMPETITIONS = [
  { code: "PL", name: "Premier League", country: "England" },
  { code: "PD", name: "La Liga", country: "Spain" },
  { code: "BL1", name: "Bundesliga", country: "Germany" },
  { code: "SA", name: "Serie A", country: "Italy" },
  { code: "FL1", name: "Ligue 1", country: "France" },
  { code: "CL", name: "UEFA Champions League", country: "Europe" },
  { code: "EC", name: "European Championship", country: "Europe" },
  { code: "WC", name: "FIFA World Cup", country: "World" },
  { code: "ELC", name: "Championship", country: "England" },
  { code: "PPL", name: "Primeira Liga", country: "Portugal" },
  { code: "DED", name: "Eredivisie", country: "Netherlands" },
  { code: "BSA", name: "Campeonato Brasileiro Série A", country: "Brazil" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY");

    if (!apiKey) {
      throw new Error("FOOTBALL_DATA_API_KEY not configured");
    }

    console.log("Fetching football leagues from football-data.org...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const supportedCodes = FOOTBALL_DATA_COMPETITIONS.map((c) => c.code);

    // Delete existing football-data leagues (and legacy rows inserted under sport='soccer')
    const { error: deleteFootballDataError } = await supabase
      .from("leagues")
      .delete()
      .eq("sport", FOOTBALL_DATA_SPORT_KEY);

    if (deleteFootballDataError) {
      console.error("Error deleting old football-data leagues:", deleteFootballDataError);
    }

    const { error: deleteLegacyCodesError } = await supabase
      .from("leagues")
      .delete()
      .eq("sport", "soccer")
      .in("league_id", supportedCodes);

    if (deleteLegacyCodesError) {
      console.error("Error deleting legacy competition-code rows:", deleteLegacyCodesError);
    }

    // Fetch all competitions from football-data.org
    const competitionsRes = await fetch("https://api.football-data.org/v4/competitions", {
      headers: { "X-Auth-Token": apiKey },
    });

    if (!competitionsRes.ok) {
      const errorText = await competitionsRes.text();
      console.error(`API error: ${competitionsRes.status}`, errorText);
      throw new Error(`Failed to fetch competitions: ${competitionsRes.status}`);
    }

    const competitionsData = await competitionsRes.json();
    console.log(
      `Fetched ${competitionsData.competitions?.length || 0} competitions from API`
    );

    // Filter to only supported competitions (free tier)
    const competitions =
      competitionsData.competitions?.filter((c: any) => supportedCodes.includes(c.code)) ||
      [];

    console.log(`Filtered to ${competitions.length} supported competitions`);

    const leaguesWithLogos = competitions.map((comp: any) => {
      const mapping = FOOTBALL_DATA_COMPETITIONS.find((m) => m.code === comp.code);
      return {
        league_id: comp.code, // Use the competition code as league_id
        league_name: comp.name,
        sport: FOOTBALL_DATA_SPORT_KEY,
        country: comp.area?.name || mapping?.country || "Unknown",
        logo_url: comp.emblem || null,
        description: null,
        website: null,
        year_founded: comp.currentSeason?.startDate
          ? parseInt(comp.currentSeason.startDate.substring(0, 4))
          : null,
      };
    });

    console.log(`Prepared ${leaguesWithLogos.length} leagues for insertion`);

    // Insert leagues into database
    const { data, error } = await supabase.from("leagues").insert(leaguesWithLogos).select();

    if (error) {
      console.error("Error inserting leagues:", error);
      throw error;
    }

    console.log(`Successfully stored ${leaguesWithLogos.length} football leagues`);

    return new Response(
      JSON.stringify({
        success: true,
        count: leaguesWithLogos.length,
        leagues: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-football-leagues function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
