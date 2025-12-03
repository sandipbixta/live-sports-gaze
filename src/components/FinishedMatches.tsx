import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Trophy, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

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
  const [selectedLeague, setSelectedLeague] = useState<string>("all");

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

  // Get unique leagues for the filter
  const leagues = useMemo(() => {
    if (!matches) return [];
    const uniqueLeagues = Array.from(new Set(matches.map(m => m.competition.name)));
    return uniqueLeagues.sort();
  }, [matches]);

  // Filter matches by selected league
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    if (selectedLeague === "all") return matches;
    return matches.filter(m => m.competition.name === selectedLeague);
  }, [matches, selectedLeague]);

  const handleMatchClick = (competitionId: number, competitionName: string) => {
    // Navigate to football league detail page
    navigate(`/football-league/${competitionId}`);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Finished Match Results</h2>
          </div>
          <Skeleton className="h-10 w-[180px]" />
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
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Finished Match Results</h2>
        </div>
        <Select value={selectedLeague} onValueChange={setSelectedLeague}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Leagues" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="all">All Leagues</SelectItem>
            {leagues.map((league) => (
              <SelectItem key={league} value={league}>
                {league}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {filteredMatches.map((match) => (
          <Card
            key={match.id}
            onClick={() => handleMatchClick(match.competition.id, match.competition.name)}
            className="min-w-[140px] overflow-hidden cursor-pointer transition-all duration-300 rounded-2xl backdrop-blur-md shadow-lg bg-card/50 border-border hover:bg-card/80 hover:border-sports-primary/30 hover:shadow-sports-primary/20"
          >
            <div className="p-2 flex flex-col gap-1.5">
              {/* Competition Badge */}
              <div className="flex items-center gap-1 pb-1 border-b border-border/50">
                <div className="w-4 h-4 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {match.competition.logo ? (
                    <img
                      src={match.competition.logo}
                      alt={match.competition.name}
                      className="w-3 h-3 object-contain"
                    />
                  ) : (
                    <Trophy className="w-2.5 h-2.5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground truncate">
                  {match.competition.name}
                </span>
              </div>

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {match.homeTeam.logo ? (
                      <img
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-muted" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-foreground truncate">
                    {match.homeTeam.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground ml-1">
                  {match.score.home}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {match.awayTeam.logo ? (
                      <img
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-muted" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-foreground truncate">
                    {match.awayTeam.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground ml-1">
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

export default FinishedMatches;
