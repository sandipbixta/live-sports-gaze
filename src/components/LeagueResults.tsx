import React, { useEffect, useState } from 'react';
import { matchesService } from '@/services/matchesService';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { teamLogoService } from '@/services/teamLogoService';

interface MatchResult {
  id: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  completed: boolean;
  league: string;
}

const FEATURED_LEAGUES = [
  { name: 'Premier League', sportKey: 'soccer_epl' },
  { name: 'La Liga', sportKey: 'soccer_spain_la_liga' },
  { name: 'Serie A', sportKey: 'soccer_italy_serie_a' },
  { name: 'Bundesliga', sportKey: 'soccer_germany_bundesliga' },
];

const LeagueResults: React.FC = () => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const allResults: MatchResult[] = [];

      for (const league of FEATURED_LEAGUES) {
        try {
          const response = await matchesService.fetchRecentScores(league.sportKey);
          if (response.success && response.scores) {
            const leagueResults = response.scores.slice(0, 3).map((score: any) => ({
              id: score.match_id || score.id,
              home_team: score.home_team,
              away_team: score.away_team,
              home_score: score.scores?.[0]?.score,
              away_score: score.scores?.[1]?.score,
              completed: score.completed || true,
              league: league.name,
            }));
            allResults.push(...leagueResults);
          }
        } catch (error) {
          console.error(`Error fetching ${league.name} results:`, error);
        }
      }

      setResults(allResults);
      setLoading(false);
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Recent Results</h2>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-48 flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8 px-12">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Recent Results</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3">
          {results.map((result) => {
            const homeLogo = teamLogoService.getTeamLogo(result.home_team);
            const awayLogo = teamLogoService.getTeamLogo(result.away_team);
            
            return (
              <CarouselItem key={result.id} className="pl-2 md:pl-3 basis-auto">
                <Card className="w-48 h-32 p-3 bg-card hover:bg-accent/50 transition-colors border border-border">
                  <div className="text-xs text-muted-foreground mb-2 truncate">{result.league}</div>
                  
                  <div className="flex items-center justify-between gap-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="w-10 h-10 mb-1 flex items-center justify-center">
                        {homeLogo ? (
                          <img 
                            src={homeLogo} 
                            alt={result.home_team}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {result.home_team.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center line-clamp-2 leading-tight">
                        {result.home_team}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xl font-bold text-foreground">
                        {result.home_score ?? '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">-</div>
                      <div className="text-xl font-bold text-foreground">
                        {result.away_score ?? '-'}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="w-10 h-10 mb-1 flex items-center justify-center">
                        {awayLogo ? (
                          <img 
                            src={awayLogo} 
                            alt={result.away_team}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {result.away_team.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center line-clamp-2 leading-tight">
                        {result.away_team}
                      </span>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </div>
  );
};

export default LeagueResults;
