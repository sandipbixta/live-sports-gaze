import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive, filterActiveMatches } from '../utils/matchUtils';
import { isTrendingMatch } from '../utils/popularLeagues';
import MatchCard from './MatchCard';
import { useToast } from '../hooks/use-toast';

interface AllSportsLiveMatchesProps {
  searchTerm?: string;
}

const AllSportsLiveMatches: React.FC<AllSportsLiveMatchesProps> = ({ searchTerm = '' }) => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Filter and consolidate live matches (remove ended matches)
        const cleanLiveMatches = filterActiveMatches(filterCleanMatches(liveMatchesData));
        const consolidatedLiveMatches = consolidateMatches(cleanLiveMatches);
        setLiveMatches(consolidatedLiveMatches);
        
        // Filter and consolidate all matches (for top league section, remove ended matches)
        const cleanAllMatches = filterActiveMatches(filterCleanMatches(allMatchesData));
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

  // Filter matches by search term (ended matches already filtered out in data loading)
  const filteredMatches = React.useMemo(() => {
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
    
    return matches;
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
        const allFootballMatches = allMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football'
        );
        
        // More specific filtering for actual top league matches
        const topLeagueKeywords = [
          'premier league', 'epl', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
          'champions league', 'ucl', 'europa league', 'conference league',
          'manchester united', 'liverpool', 'manchester city', 'chelsea', 'arsenal', 'tottenham',
          'fc barcelona', 'real madrid', 'juventus', 'ac milan', 'inter milan', 'napoli',
          'bayern munich', 'borussia dortmund', 'psg', 'atletico madrid', 'ajax', 'psv'
        ];
        
        // More comprehensive exclusion for non-top league matches
        const excludeKeywords = [
          'barcelona sc', 'barcelona sporting', 'guayaquil', 'u23', 'u21', 'u19', 'u18',
          'youth', 'reserve', 'academy', 'segunda', 'segunda b', 'tercera', 'amateur',
          'league two', 'league one', 'conference', 'non-league', 'women', 'female',
          'womens', "women's", 'ladies', 'feminino', 'femenino', 'damen', 'feminine',
          'copa', 'friendly', 'amistoso', 'preseason', 'pre-season'
        ];
        
        const topLeagueFootballMatches = allFootballMatches
          .filter(match => {
            const title = match.title.toLowerCase();
            
            // Exclude women's matches (including patterns like "team w vs team w")
            if (title.includes(' w vs ') || title.includes(' w ') || 
                excludeKeywords.some(keyword => title.includes(keyword))) {
              return false;
            }
            
            // Must contain at least one top league keyword
            const hasTopLeagueKeyword = topLeagueKeywords.some(keyword => title.includes(keyword));
            
            // More flexible format check - allow more match formats
            const hasProperFormat = title.includes(' vs ') || title.includes(' - ') || 
              title.includes(' v ') || title.includes(':') || match.popular;
            
            // Debug logging
            if (hasTopLeagueKeyword) {
              console.log('🏆 Top League Football match found:', title, 'hasFormat:', hasProperFormat);
            }
            
            return hasTopLeagueKeyword && hasProperFormat;
          })
          .sort((a, b) => {
            const scoreA = isTrendingMatch(a.title).score;
            const scoreB = isTrendingMatch(b.title).score;
            return scoreB - scoreA;
          })
          .slice(0, 6);
        
        if (topLeagueFootballMatches.length > 0) {
          return (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xl">⚽</div>
                <h3 className="text-xl font-bold text-white">Top League Football</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {topLeagueFootballMatches.map((match) => (
                  <MatchCard
                    key={`top-football-${match.id}`}
                    match={match}
                    sportId={match.sportId || match.category}
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllSportsLiveMatches;