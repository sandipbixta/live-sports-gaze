import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { fetchUpcomingMatches, FootballMatch } from "@/services/footballDataService";
import { format } from "date-fns";

const UpcomingMatches = () => {
  const navigate = useNavigate();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['upcoming-football-matches'],
    queryFn: fetchUpcomingMatches,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000,
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
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Upcoming Matches</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
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
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Upcoming Matches</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {matches.map((match) => (
          <Card
            key={match.id}
            onClick={() => handleMatchClick(match.competition.id)}
            className="min-w-[160px] p-3 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-border"
          >
            <div className="flex flex-col gap-2">
              {/* Competition & Date */}
              <div className="flex flex-col gap-1 pb-2 border-b border-border">
                <div className="flex items-center gap-1.5">
                  {match.competition.logo ? (
                    <img
                      src={match.competition.logo}
                      alt={match.competition.name}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  ) : (
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-[10px] text-muted-foreground truncate">
                    {match.competition.code || match.competition.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(match.utcDate), "MMM dd, HH:mm")}
                  </span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex items-center gap-1.5">
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

              {/* VS Divider */}
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground font-medium">VS</span>
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-1.5">
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMatches;
