import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

interface FinishedMatch {
  id: number;
  homeTeam: {
    name: string;
    logo: string | null;
  };
  awayTeam: {
    name: string;
    logo: string | null;
  };
  score: {
    home: number;
    away: number;
  };
  competition: {
    id: number;
    name: string;
    logo: string | null;
  };
  utcDate: string;
}

const FinishedMatches = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['finished-matches'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-finished-matches');
      
      if (error) throw error;
      return data as FinishedMatch[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  const handleMatchClick = (competitionId: number, competitionName: string) => {
    // Map competition IDs to league routes
    const leagueMap: Record<number, string> = {
      2021: 'premier-league', // Premier League
      2014: 'laliga', // La Liga
      2015: 'ligue-1', // Ligue 1
      2002: 'bundesliga', // Bundesliga
      2019: 'serie-a', // Serie A
      2001: 'champions-league', // Champions League
    };

    const leagueRoute = leagueMap[competitionId];
    if (leagueRoute) {
      navigate(`/leagues/${leagueRoute}`);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Finished Match Results</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="min-w-[200px] h-[140px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Finished Match Results</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {matches.map((match) => (
          <Card
            key={match.id}
            onClick={() => handleMatchClick(match.competition.id, match.competition.name)}
            className="min-w-[200px] p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-border"
          >
            <div className="flex flex-col gap-3">
              {/* Competition Badge */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                {match.competition.logo ? (
                  <img
                    src={match.competition.logo}
                    alt={match.competition.name}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {match.competition.name}
                </span>
              </div>

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.homeTeam.logo ? (
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-6 h-6 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {match.homeTeam.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground ml-2">
                  {match.score.home}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.awayTeam.logo ? (
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-6 h-6 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {match.awayTeam.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground ml-2">
                  {match.score.away}
                </span>
              </div>

              {/* Full Time Badge */}
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground font-medium">
                  FT
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinishedMatches;
