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

const CACHE_KEY = 'league_results_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

interface CachedData {
  results: MatchResult[];
  timestamp: number;
}

const LeagueResults: React.FC = () => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const cachedData: CachedData = JSON.parse(cached);
          const cacheAge = Date.now() - cachedData.timestamp;
          
          if (cacheAge < CACHE_DURATION) {
            console.log('Using cached league results');
            setResults(cachedData.results);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing cache:', error);
        }
      }
      
      // Fetch fresh data
      const allResults: MatchResult[] = [];

      for (const league of FEATURED_LEAGUES) {
        try {
          const response = await matchesService.fetchRecentScores(league.sportKey);
          if (response.success && response.scores) {
            const leagueResults = response.scores.slice(0, 3).map((score: any) => ({
              id: score.match_id || score.id,
              home_team: score.home_team,
              away_team: score.away_team,
              home_score: score.home_score,
              away_score: score.away_score,
              completed: score.completed || true,
              league: league.name,
            }));
            allResults.push(...leagueResults);
          }
        } catch (error) {
          console.error(`Error fetching ${league.name} results:`, error);
        }
      }

      // Cache the results
      const cacheData: CachedData = {
        results: allResults,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
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
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3">
          {results.map((result) => {
            const homeWon = (result.home_score ?? 0) > (result.away_score ?? 0);
            const awayWon = (result.away_score ?? 0) > (result.home_score ?? 0);
            
            return (
              <CarouselItem key={result.id} className="pl-2 md:pl-3 basis-auto">
                <Card className="w-40 h-28 p-3 bg-card hover:bg-accent/50 transition-all duration-200 border border-border cursor-grab active:cursor-grabbing">
                  <div className="text-xs text-muted-foreground mb-2 truncate font-medium">{result.league}</div>
                  
                  <div className="space-y-1">
                    {/* Home Team */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate flex-1 ${homeWon ? 'font-bold text-foreground' : 'font-normal text-muted-foreground'}`}>
                        {result.home_team}
                      </span>
                      <span className={`text-base font-bold min-w-[24px] text-right ${homeWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {result.home_score ?? '-'}
                      </span>
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate flex-1 ${awayWon ? 'font-bold text-foreground' : 'font-normal text-muted-foreground'}`}>
                        {result.away_team}
                      </span>
                      <span className={`text-base font-bold min-w-[24px] text-right ${awayWon ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {result.away_score ?? '-'}
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
