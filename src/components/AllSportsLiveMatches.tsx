import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';
import { isTrendingMatch } from '../utils/popularLeagues';
import MatchCard from './MatchCard';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { Globe, Flag } from 'lucide-react';

interface AllSportsLiveMatchesProps {
  searchTerm?: string;
}

const AllSportsLiveMatches: React.FC<AllSportsLiveMatchesProps> = ({ searchTerm = '' }) => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<'all' | 'european' | 'usa'>('all');

  // Helper functions for region filtering
  const isEuropeanLeague = (title: string): boolean => {
    const lowerTitle = title.toLowerCase();
    
    const europeanKeywords = [
      // Top 5 European leagues
      'premier league', 'epl', 'english premier league',
      'la liga', 'spanish league', 'spanish football',
      'serie a', 'italian league', 'calcio',
      'bundesliga', 'german league', 'german football', 
      'ligue 1', 'french league', 'french football',
      
      // UEFA competitions
      'champions league', 'ucl', 'uefa champions league',
      'europa league', 'uel', 'uefa europa',
      'conference league', 'uecl', 'uefa conference',
      'uefa', 'euro', 'nations league', 'uefa nations league',
      'uefa super cup', 'supercup', 'super cup',
      
      // Major European clubs
      'manchester united', 'liverpool', 'manchester city', 'chelsea', 'arsenal', 'tottenham',
      'barcelona', 'real madrid', 'atletico madrid',
      'juventus', 'ac milan', 'inter milan', 'napoli', 'roma',
      'bayern munich', 'dortmund', 'rb leipzig',
      'psg', 'paris saint-germain', 'marseille', 'lyon',
      
      // European national teams
      'spain', 'france', 'england', 'germany', 'italy', 'portugal', 'netherlands',
      'belgium', 'croatia', 'poland', 'ukraine', 'denmark', 'switzerland'
    ];
    
    return europeanKeywords.some(keyword => lowerTitle.includes(keyword));
  };

  const isUSALeague = (title: string): boolean => {
    const lowerTitle = title.toLowerCase();
    
    const usaKeywords = [
      // MLS teams and league
      'mls', 'major league soccer',
      'inter miami', 'miami', 'seattle sounders', 'sounders',
      'atlanta united', 'lafc', 'los angeles fc', 'la galaxy',
      'new york city fc', 'nycfc', 'new york red bulls',
      'toronto fc', 'portland timbers', 'chicago fire',
      'philadelphia union', 'columbus crew', 'fc dallas',
      'vancouver whitecaps', 'montreal impact', 'cf montreal',
      'orlando city', 'minnesota united', 'colorado rapids',
      'sporting kansas city', 'real salt lake', 'houston dynamo',
      'san jose earthquakes', 'dc united',
      
      // US National team
      'usa', 'united states', 'usmnt', 'uswnt',
      'america', 'american',
      
      // Other US leagues/competitions
      'us open cup', 'concacaf', 'gold cup'
    ];
    
    return usaKeywords.some(keyword => lowerTitle.includes(keyword));
  };

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        setLoading(true);
        
        // Fetch sports, live matches, and all matches in parallel
        const [sportsData, liveMatchesData, allMatchesData] = await Promise.all([
          fetchSports(),
          fetchLiveMatches(),
          fetchAllMatches()
        ]);
        
        setSports(sportsData);
        
        // Filter and consolidate live matches
        const cleanLiveMatches = filterCleanMatches(liveMatchesData);
        const consolidatedLiveMatches = consolidateMatches(cleanLiveMatches);
        setLiveMatches(consolidatedLiveMatches);
        
        // Filter and consolidate all matches (for top league section)
        const cleanAllMatches = filterCleanMatches(allMatchesData);
        const consolidatedAllMatches = consolidateMatches(cleanAllMatches);
        setAllMatches(consolidatedAllMatches);
        
        console.log(`✅ Loaded ${consolidatedLiveMatches.length} live matches and ${consolidatedAllMatches.length} total matches from all sports`);
        console.log('Live matches by sport:', consolidatedLiveMatches.reduce((acc, match) => {
          const sport = match.sportId || match.category || 'unknown';
          acc[sport] = (acc[sport] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: "Error",
          description: "Failed to load matches.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLiveMatches();
  }, [toast]);

  // Filter matches by search term and time restrictions
  const filteredMatches = React.useMemo(() => {
    const now = Date.now();
    
    let matches = liveMatches;
    
    // Apply search filter if provided
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      matches = matches.filter(match => {
        return match.title.toLowerCase().includes(lowercaseSearch) || 
          match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
          match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
      });
    }
    
    // Apply time-based filtering for football matches
    return matches.filter(match => {
      const timeSinceStart = now - match.date;
      
      // Hide football matches after 2.5 hours (150 minutes)
      const isFootball = (match.sportId || match.category || '').toLowerCase() === 'football';
      if (isFootball && timeSinceStart > 150 * 60 * 1000) {
        return false;
      }
      
      return true;
    });
  }, [liveMatches, searchTerm]);

  // Group matches by sport
  const matchesBySport = React.useMemo(() => {
    const grouped: { [sportId: string]: Match[] } = {};
    
    filteredMatches.forEach(match => {
      const sportId = match.sportId || match.category || 'unknown';
      if (!grouped[sportId]) {
        grouped[sportId] = [];
      }
      grouped[sportId].push(match);
    });
    
    return grouped;
  }, [filteredMatches]);

  const getSportName = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.name || sportId.charAt(0).toUpperCase() + sportId.slice(1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="h-32 bg-[#242836] rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="bg-[#242836] border-[#343a4d] rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📺</div>
        <h3 className="text-xl font-bold text-white mb-2">No Live Matches</h3>
        <p className="text-gray-400">There are currently no live matches available.</p>
      </div>
    );
  }

  // Define preferred sport order with tennis at the end (excluded: golf, hockey, billiards)
  const getSportPriority = (sportId: string): number => {
    const sportOrder: { [key: string]: number } = {
      'football': 1,
      'basketball': 2, 
      'american-football': 3,
      'baseball': 4,
      'motor-sports': 5,
      'fight': 6,
      'rugby': 7,
      'cricket': 8,
      'afl': 9,
      'other': 10,
      'tennis': 12  // Tennis moved to last position
    };
    
    const normalizedSportId = sportId.toLowerCase();
    
    // Check for exact match first
    if (sportOrder[normalizedSportId] !== undefined) {
      return sportOrder[normalizedSportId];
    }
    
    // Check for partial matches
    for (const [sport, priority] of Object.entries(sportOrder)) {
      if (normalizedSportId.includes(sport) || sport.includes(normalizedSportId)) {
        return priority;
      }
    }
    
    // Unknown sports get high priority (but before tennis)
    return 14.5;
  };

  // Sort sports by priority with tennis at the end
  const sortedSports = Object.entries(matchesBySport).sort(([sportIdA], [sportIdB]) => {
    const priorityA = getSportPriority(sportIdA);
    const priorityB = getSportPriority(sportIdB);
    return priorityA - priorityB;
  });

  return (
    <div className="space-y-8">
      {/* Top League Football Matches - Live and Scheduled */}
      {(() => {
        // Get both live and scheduled football matches from allMatches
        let allFootballMatches = allMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football'
        );

        // Apply region filter
        if (regionFilter === 'european') {
          allFootballMatches = allFootballMatches.filter(match => isEuropeanLeague(match.title));
        } else if (regionFilter === 'usa') {
          allFootballMatches = allFootballMatches.filter(match => isUSALeague(match.title));
        }
        
        // More specific filtering for actual top league matches
        const topLeagueKeywords = [
          'premier league', 'epl', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
          'champions league', 'ucl', 'europa league', 'conference league',
          'manchester united', 'liverpool', 'manchester city', 'chelsea', 'arsenal', 'tottenham',
          'fc barcelona', 'real madrid', 'juventus', 'ac milan', 'inter milan', 'napoli',
          'bayern munich', 'borussia dortmund', 'psg', 'atletico madrid', 'ajax', 'psv',
          // Add MLS keywords for USA filter
          'mls', 'inter miami', 'seattle sounders', 'atlanta united', 'lafc', 'la galaxy'
        ];
        
        // More comprehensive exclusion for non-top league matches
        const excludeKeywords = [
          'barcelona sc', 'barcelona sporting', 'guayaquil', 'u23', 'u21', 'u19', 'u18',
          'youth', 'reserve', 'academy', 'segunda', 'segunda b', 'tercera', 'amateur',
          'league two', 'league one', 'conference', 'non-league', 'women', 'female',
          'copa', 'friendly', 'amistoso', 'preseason', 'pre-season'
        ];
        
        const topLeagueFootballMatches = allFootballMatches
          .filter(match => {
            const title = match.title.toLowerCase();
            const now = Date.now();
            const timeSinceStart = now - match.date;
            
            // Hide football matches after 2.5 hours (150 minutes)
            if (timeSinceStart > 150 * 60 * 1000) {
              return false;
            }
            
            // Exclude lower league and non-professional matches
            if (excludeKeywords.some(keyword => title.includes(keyword))) {
              return false;
            }
            
            // Must contain at least one top league keyword
            const hasTopLeagueKeyword = topLeagueKeywords.some(keyword => title.includes(keyword));
            
            // Additional check: if it contains "vs" or "-", it should be a proper match format
            const hasProperFormat = title.includes(' vs ') || title.includes(' - ');
            
            // Debug logging
            if (hasTopLeagueKeyword && hasProperFormat) {
              console.log('🏆 Top League Football match found:', title);
            }
            
            return hasTopLeagueKeyword && hasProperFormat;
          })
          .sort((a, b) => {
            const scoreA = isTrendingMatch(a.title).score;
            const scoreB = isTrendingMatch(b.title).score;
            return scoreB - scoreA;
          })
          .slice(0, 6);

        // Get counts for filter buttons
        const europeanCount = allMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football' && isEuropeanLeague(match.title)
        ).length;
        
        const usaCount = allMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football' && isUSALeague(match.title)
        ).length;

        const totalFootballCount = allMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football'
        ).length;
        
        if (topLeagueFootballMatches.length > 0) {
          return (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xl">⚽</div>
                <h3 className="text-xl font-bold text-white">
                  {regionFilter === 'european' ? 'European Football' : 
                   regionFilter === 'usa' ? 'USA Football' : 'Top League Football'}
                </h3>
              </div>
              
              {/* Region Filter Buttons */}
              {totalFootballCount > 0 && (
                <div className="mb-4 overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-[#9b87f5]" />
                    <span className="text-sm font-medium text-gray-300">Filter by region:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        regionFilter === 'all' 
                          ? 'bg-[#343a4d] border-[#ff5a36]' 
                          : 'bg-[#242836] border-[#343a4d]'
                      } whitespace-nowrap`}
                      onClick={() => setRegionFilter('all')}
                    >
                      All ({totalFootballCount})
                    </Button>
                    
                    {europeanCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          regionFilter === 'european' 
                            ? 'bg-[#343a4d] border-[#ff5a36]' 
                            : 'bg-[#242836] border-[#343a4d]'
                        } whitespace-nowrap flex items-center gap-1`}
                        onClick={() => setRegionFilter('european')}
                      >
                        <Flag size={14} />
                        European ({europeanCount})
                      </Button>
                    )}
                    
                    {usaCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          regionFilter === 'usa' 
                            ? 'bg-[#343a4d] border-[#ff5a36]' 
                            : 'bg-[#242836] border-[#343a4d]'
                        } whitespace-nowrap flex items-center gap-1`}
                        onClick={() => setRegionFilter('usa')}
                      >
                        <Flag size={14} />
                        USA ({usaCount})
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {topLeagueFootballMatches.map((match) => (
                  <MatchCard
                    key={`top-football-${match.id}`}
                    match={match}
                    sportId={match.sportId || match.category}
                    showViewers={true}
                  />
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Popular by Viewers Section */}
      {(() => {
        const popularMatches = filteredMatches
          .filter(match => match.popular || (match.sources && match.sources.length >= 2))
          .sort((a, b) => {
            // Sort by popular flag first, then by number of sources
            if (a.popular && !b.popular) return -1;
            if (!a.popular && b.popular) return 1;
            return (b.sources?.length || 0) - (a.sources?.length || 0);
          })
          .slice(0, 6);
        
        if (popularMatches.length > 0) {
          return (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xl">🔥</div>
                <h3 className="text-xl font-bold text-white">Popular by Viewers</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {popularMatches.map((match) => (
                  <MatchCard
                    key={`popular-${match.sportId || 'unknown'}-${match.id}`}
                    match={match}
                    sportId={match.sportId || match.category}
                    showViewers={true}
                  />
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Sports Sections */}
      {sortedSports.map(([sportId, matches]) => (
        <div key={sportId} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {getSportName(sportId)}
            </h3>
            <span className="text-sm text-gray-400">
              {matches.length} live match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {matches.map((match) => (
              <MatchCard
                key={`${match.sportId || sportId}-${match.id}`}
                match={match}
                sportId={match.sportId || sportId}
                showViewers={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllSportsLiveMatches;