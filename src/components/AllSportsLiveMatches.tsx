import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';
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

  // Sort sports to show football first
  const sortedSports = Object.entries(matchesBySport).sort(([sportIdA], [sportIdB]) => {
    const isFootballA = sportIdA.toLowerCase().includes('football') || sportIdA.toLowerCase().includes('soccer') || sportIdA === '1';
    const isFootballB = sportIdB.toLowerCase().includes('football') || sportIdB.toLowerCase().includes('soccer') || sportIdB === '1';
    
    if (isFootballA && !isFootballB) return -1;
    if (!isFootballA && isFootballB) return 1;
    return 0;
  });

  return (
    <div className="space-y-8">
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