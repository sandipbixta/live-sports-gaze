import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { fetchLiveMatches, FootballMatch } from "@/services/footballDataService";

const LiveMatchesFootball = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['live-football-matches'],
    queryFn: fetchLiveMatches,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  const handleMatchClick = (competitionId: number) => {
    const leagueMap: Record<number, string> = {
      2021: 'premier-league',
      2014: 'laliga',
      2015: 'ligue-1',
      2002: 'bundesliga',
      2019: 'serie-a',
      2001: 'champions-league',
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
          <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          <h2 className="text-xl font-bold text-foreground">Live Football Matches</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="min-w-[160px] h-[120px] rounded-lg" />
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
        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">Live Football Matches</h2>
        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
          LIVE
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {matches.map((match) => (
          <Card
            key={match.id}
            onClick={() => handleMatchClick(match.competition.id)}
            className="min-w-[160px] p-3 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-border border-red-500/30"
          >
            <div className="flex flex-col gap-2">
              {/* Competition & Time */}
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-1.5">
                  {match.competition.logo ? (
                    <img
                      src={match.competition.logo}
                      alt={match.competition.name}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-[10px] text-muted-foreground truncate">
                    {match.competition.code || match.competition.name}
                  </span>
                </div>
                {match.minute && (
                  <span className="text-[10px] text-red-500 font-bold">
                    {match.minute}'
                  </span>
                )}
              </div>

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {match.homeTeam.logo ? (
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate">
                    {match.homeTeam.shortName || match.homeTeam.name}
                  </span>
                </div>
                <span className="text-base font-bold text-foreground ml-2">
                  {match.score.home}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {match.awayTeam.logo ? (
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-5 h-5 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate">
                    {match.awayTeam.shortName || match.awayTeam.name}
                  </span>
                </div>
                <span className="text-base font-bold text-foreground ml-2">
                  {match.score.away}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveMatchesFootball;
