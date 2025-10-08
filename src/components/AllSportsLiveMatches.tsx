import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, filterActiveMatches, sortMatchesByViewers } from '../utils/matchUtils';
import { enrichMatchesWithViewerCounts } from '../utils/viewerCount';
import { filterMatchesWithImages } from '../utils/matchImageFilter';
import MatchCard from './MatchCard';
import { useToast } from '../hooks/use-toast';
import { TrendingUp } from 'lucide-react';

interface AllSportsLiveMatchesProps {
  searchTerm?: string;
}

const AllSportsLiveMatches: React.FC<AllSportsLiveMatchesProps> = ({ searchTerm = '' }) => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostViewedMatches, setMostViewedMatches] = useState<Match[]>([]);

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
        
        // Filter and consolidate live matches (remove matches without sources and ended matches)
        const cleanLiveMatches = filterActiveMatches(filterCleanMatches(
          liveMatchesData.filter(m => m.sources && m.sources.length > 0)
        ));
        const consolidatedLiveMatches = consolidateMatches(cleanLiveMatches);
        setLiveMatches(consolidatedLiveMatches);
        
        // Filter and consolidate all matches (must have sources, remove ended matches)
        const cleanAllMatches = filterActiveMatches(filterCleanMatches(
          allMatchesData.filter(m => m.sources && m.sources.length > 0)
        ));
        const consolidatedAllMatches = consolidateMatches(cleanAllMatches);
        setAllMatches(consolidatedAllMatches);
        
        console.log(`✅ Loaded ${consolidatedLiveMatches.length} live matches and ${consolidatedAllMatches.length} total matches from all sports`);
        console.log('Live matches by sport:', consolidatedLiveMatches.reduce((acc, match) => {
          const sport = match.sportId || match.category || 'unknown';
          acc[sport] = (acc[sport] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        // Enrich all matches with viewer counts and get top viewed (only with actual viewers)
        const enrichedAllMatches = await enrichMatchesWithViewerCounts(consolidatedAllMatches);
        
        // For "Popular by Viewers", show ALL matches with viewers (no image filter)
        const sortedByViewers = sortMatchesByViewers(enrichedAllMatches);
        const matchesWithViewers = sortedByViewers.filter(m => (m.viewerCount || 0) > 0);
        console.log('🔥 Matches with viewers:', matchesWithViewers.map(m => ({ id: m.id, title: m.title, viewers: m.viewerCount })));
        setMostViewedMatches(matchesWithViewers.slice(0, 12));
        
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

  // Refresh viewer counts every 30 seconds to show newly watched matches
  useEffect(() => {
    const refreshViewerCounts = async () => {
      if (allMatches.length === 0) return;
      
      try {
        console.log('🔄 Refreshing viewer counts for', allMatches.length, 'matches');
        const enrichedAllMatches = await enrichMatchesWithViewerCounts(allMatches);
        // Show ALL matches with viewers (no image filter)
        const sortedByViewers = sortMatchesByViewers(enrichedAllMatches);
        const matchesWithViewers = sortedByViewers.filter(m => (m.viewerCount || 0) > 0);
        console.log('🔥 Refreshed - Matches with viewers:', matchesWithViewers.map(m => ({ id: m.id, title: m.title, viewers: m.viewerCount })));
        setMostViewedMatches(matchesWithViewers.slice(0, 12));
      } catch (error) {
        console.error('Error refreshing viewer counts:', error);
      }
    };

    const interval = setInterval(refreshViewerCounts, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [allMatches]);

  // Filter matches by search term (ended matches already filtered out in data loading)
  const filteredMatches = React.useMemo(() => {
    // Show all live matches regardless of images
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

  // Group matches by sport and sort by date (newest first)
  const matchesBySport = React.useMemo(() => {
    const grouped: { [sportId: string]: Match[] } = {};
    
    filteredMatches.forEach(match => {
      const sportId = match.sportId || match.category || 'unknown';
      if (!grouped[sportId]) {
        grouped[sportId] = [];
      }
      grouped[sportId].push(match);
    });
    
    // Sort matches within each sport by date (newest/most recent first)
    Object.keys(grouped).forEach(sportId => {
      grouped[sportId].sort((a, b) => {
        // Sort by date descending (newest matches first)
        return b.date - a.date;
      });
    });
    
    return grouped;
  }, [filteredMatches]);

  const getSportName = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.name || sportId.charAt(0).toUpperCase() + sportId.slice(1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
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
      {/* Most Viewed Matches - Across All Sports */}
      {mostViewedMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-white">Popular by Viewer</h3>
            <span className="text-sm text-gray-400">Live across all sports</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {mostViewedMatches.map((match) => (
              <MatchCard
                key={`most-viewed-${match.id}`}
                match={match}
                sportId={match.sportId || match.category}
              />
            ))}
          </div>
        </div>
      )}

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
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
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