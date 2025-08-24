import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';
import { isTrendingMatch } from '../utils/popularLeagues';
import MatchCard from './MatchCard';
import { useToast } from '../hooks/use-toast';

interface AllSportsLiveMatchesProps {
  searchTerm?: string;
}

const AllSportsLiveMatches: React.FC<AllSportsLiveMatchesProps> = ({ searchTerm = '' }) => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        setLoading(true);
        
        // Fetch sports and live matches in parallel
        const [sportsData, matchesData] = await Promise.all([
          fetchSports(),
          fetchLiveMatches()
        ]);
        
        setSports(sportsData);
        
        // Filter and consolidate matches
        const cleanMatches = filterCleanMatches(matchesData);
        const consolidatedMatches = consolidateMatches(cleanMatches);
        
        // Since fetchLiveMatches already returns live matches, no need to filter again
        setLiveMatches(consolidatedMatches);
        console.log(`✅ Loaded ${consolidatedMatches.length} live matches from all sports`);
        console.log('Live matches by sport:', consolidatedMatches.reduce((acc, match) => {
          const sport = match.sportId || match.category || 'unknown';
          acc[sport] = (acc[sport] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
      } catch (error) {
        console.error('Error loading live matches:', error);
        toast({
          title: "Error",
          description: "Failed to load live matches.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLiveMatches();
  }, [toast]);

  // Filter matches by search term
  const filteredMatches = React.useMemo(() => {
    if (!searchTerm.trim()) return liveMatches;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return liveMatches.filter(match => {
      return match.title.toLowerCase().includes(lowercaseSearch) || 
        match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
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

  // Define preferred sport order with tennis at the end
  const getSportPriority = (sportId: string): number => {
    const sportOrder: { [key: string]: number } = {
      'football': 1,
      'basketball': 2, 
      'american-football': 3,
      'hockey': 4,
      'baseball': 5,
      'motor-sports': 6,
      'fight': 7,
      'rugby': 8,
      'cricket': 9,
      'golf': 10,
      'billiards': 11,
      'afl': 12,
      'darts': 13,
      'other': 14,
      'tennis': 15  // Tennis moved to last position
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
      {/* Top League Football Matches - Above Live Matches */}
      {(() => {
        const footballMatches = filteredMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football'
        );
        
        // More specific filtering for actual top league matches
        const topLeagueKeywords = [
          'premier league', 'epl', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
          'champions league', 'ucl', 'europa league', 'conference league',
          'manchester united', 'liverpool', 'manchester city', 'chelsea', 'arsenal', 'tottenham',
          'barcelona', 'real madrid', 'juventus', 'ac milan', 'inter milan', 'napoli',
          'bayern munich', 'borussia dortmund', 'psg', 'atletico madrid'
        ];
        
        const topLeagueFootballMatches = footballMatches
          .filter(match => {
            const title = match.title.toLowerCase();
            return topLeagueKeywords.some(keyword => title.includes(keyword));
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