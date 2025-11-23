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
  { name: "Premier League", competitionCode: "PL" },
  { name: "La Liga", competitionCode: "PD" },
  { name: "Bundesliga", competitionCode: "BL1" },
  { name: "Serie A", competitionCode: "SA" },
  { name: "Ligue 1", competitionCode: "FL1" },
];

const CACHE_KEY = 'league_results_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour to reduce API calls

interface CachedData {
  results: MatchResult[];
  timestamp: number;
}

const LeagueResults: React.FC = () => {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      console.log('🏆 LeagueResults: Starting to fetch league results...');
      
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      let cachedData: CachedData | null = null;
      
      if (cached) {
        try {
          cachedData = JSON.parse(cached);
          const cacheAge = Date.now() - cachedData.timestamp;
          
          console.log(`📦 Cache found: ${cachedData.results.length} results, age: ${Math.round(cacheAge / 1000)}s`);
          
          if (cacheAge < CACHE_DURATION) {
            console.log('✅ Using cached league results');
            setResults(cachedData.results);
            setLoading(false);
            return;
          } else {
            console.log('⏰ Cache expired, fetching fresh data');
          }
        } catch (error) {
          console.error('❌ Error parsing cache:', error);
        }
      } else {
        console.log('📭 No cache found, fetching fresh data');
      }
      
      // If we have expired cache, show it while we try to fetch
      if (cachedData) {
        setResults(cachedData.results);
        setLoading(false);
      } else {
        setLoading(true);
      }
      
      // Fetch fresh data
      const allResults: MatchResult[] = [];
      let quotaExceeded = false;

      console.log(`🔄 Fetching from ${FEATURED_LEAGUES.length} leagues...`);
      
      for (const league of FEATURED_LEAGUES) {
        try {
          console.log(`📡 Fetching ${league.name} (${league.competitionCode})...`);
          const response = await matchesService.fetchRecentScores(league.competitionCode);
          
          console.log(`📥 ${league.name} response:`, response);
          
          // Check for quota exceeded
          if (response.quotaExceeded) {
            console.warn(`⚠️ ${league.name}: Quota exceeded`);
            quotaExceeded = true;
            break;
          }
          
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
            console.log(`✅ ${league.name}: Added ${leagueResults.length} results`);
            allResults.push(...leagueResults);
          } else {
            console.warn(`⚠️ ${league.name}: No scores in response`);
          }
        } catch (error) {
          console.error(`❌ Error fetching ${league.name} results:`, error);
        }
      }

      // If quota exceeded, keep using old cached data
      if (quotaExceeded) {
        console.log('⚠️ API quota exceeded, using cached data');
        if (cachedData) {
          setResults(cachedData.results);
        }
        setLoading(false);
        return;
      }

      // Cache the new results if we got any
      if (allResults.length > 0) {
        console.log(`✅ Successfully fetched ${allResults.length} total results, caching...`);
        const newCacheData: CachedData = {
          results: allResults,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCacheData));
        setResults(allResults);
      } else {
        console.warn('⚠️ No results fetched from any league');
      }
      
      setLoading(false);
      console.log('🏁 LeagueResults: Fetch complete');
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
