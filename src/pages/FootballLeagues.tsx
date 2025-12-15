import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Globe, RefreshCw } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface League {
  id: string;
  league_id: string;
  league_name: string;
  sport: string;
  country: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  year_founded: number | null;
}

const FootballLeagues = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch leagues from database (populated by football-data.org)
  const { data: leagues, isLoading, error, refetch } = useQuery({
    queryKey: ["football-data-leagues"],
    queryFn: async () => {
      // Try to get from database first
      const { data: dbLeagues, error: dbError } = await supabase
        .from("leagues")
        .select("*")
        .eq("sport", "football_data")
        .order("league_name");

      if (dbError) throw dbError;

      // If no leagues in DB, fetch from edge function
      if (!dbLeagues || dbLeagues.length === 0) {
        const { data, error } = await supabase.functions.invoke(
          "fetch-football-leagues"
        );
        if (error) throw error;
        return (data?.leagues as League[]) || [];
      }

      return dbLeagues as League[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force fetch new data from football-data.org
      await supabase.functions.invoke("fetch-football-leagues");
      await refetch();
    } catch (err) {
      console.error("Error refreshing leagues:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLeagueClick = (leagueId: string) => {
    // Navigate to football-league detail page with competition code
    navigate(`/football-league/${leagueId}`);
  };

  // Categorize leagues by region
  const europeanLeagues =
    leagues?.filter((l) =>
      ["England", "Spain", "Germany", "Italy", "France", "Netherlands", "Portugal"].includes(
        l.country || ""
      )
    ) || [];

  const europeanCompetitions =
    leagues?.filter(
      (l) =>
        l.country === "Europe" ||
        l.league_name.includes("UEFA") ||
        l.league_name.includes("Champions")
    ) || [];

  const americanLeagues =
    leagues?.filter((l) =>
      ["Brazil", "Argentina", "United States"].includes(l.country || "")
    ) || [];

  const internationalCompetitions =
    leagues?.filter(
      (l) =>
        l.country === "World" ||
        l.league_name.includes("World Cup") ||
        l.league_name.includes("European Championship")
    ) || [];

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Football Leagues</h1>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(12)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-3 w-3/4 mx-auto mb-1" />
                  <Skeleton className="h-2 w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Football Leagues</h1>
          </div>
          <div className="text-center py-8 bg-card rounded-lg border border-border">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Loading Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to load leagues. Please try again.
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Retry
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const LeagueCard = ({ league }: { league: League }) => (
    <Card
      onClick={() => handleLeagueClick(league.league_id)}
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
    >
      <CardContent className="p-3 text-center">
        <div className="relative w-16 h-16 mx-auto mb-2">
          {league.logo_url ? (
            <img
              src={league.logo_url}
              alt={league.league_name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <h3 className="font-bold text-xs mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {league.league_name}
        </h3>
        <p className="text-[10px] text-muted-foreground">{league.country}</p>
      </CardContent>
    </Card>
  );

  const LeagueSection = ({
    title,
    icon,
    leagues,
  }: {
    title: string;
    icon: React.ReactNode;
    leagues: League[];
  }) => {
    if (leagues.length === 0) return null;
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {leagues.map((league) => (
            <LeagueCard key={league.league_id} league={league} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Football Leagues & Competitions</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        <LeagueSection
          title="Top European Leagues"
          icon={<Trophy className="w-5 h-5 text-primary" />}
          leagues={europeanLeagues}
        />

        <LeagueSection
          title="UEFA Competitions"
          icon={<Globe className="w-5 h-5 text-primary" />}
          leagues={europeanCompetitions}
        />

        <LeagueSection
          title="American Leagues"
          icon={<Trophy className="w-5 h-5 text-primary" />}
          leagues={americanLeagues}
        />

        <LeagueSection
          title="International Competitions"
          icon={<Globe className="w-5 h-5 text-primary" />}
          leagues={internationalCompetitions}
        />
      </div>
    </PageLayout>
  );
};

export default FootballLeagues;
