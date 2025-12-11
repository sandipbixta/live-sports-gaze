import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, sortMatchesByViewers } from '../utils/matchUtils';
import { enrichMatchesWithViewers, isMatchLive } from '../services/viewerCountService';
import MatchCard from './MatchCard';
import AllChannelsGrid from './AllChannelsGrid';
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const [mostViewedMatches, setMostViewedMatches] = useState<Match[]>([]);

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        // NO setLoading(true) - let content render immediately
        
        // Fetch sports, live matches, and all matches in parallel
        const [sportsData, liveMatchesData, allMatchesData] = await Promise.all([
          fetchSports(),
          fetchLiveMatches(),
          fetchAllMatches()
        ]);
        
        setSports(sportsData);
        
        // Filter and consolidate live matches (remove matches without sources)
        const cleanLiveMatches = filterCleanMatches(
          liveMatchesData.filter(m => m.sources && m.sources.length > 0)
        );
        const consolidatedLiveMatches = consolidateMatches(cleanLiveMatches);
        setLiveMatches(consolidatedLiveMatches);
        
        // Filter and consolidate all matches (must have sources)
        const cleanAllMatches = filterCleanMatches(
          allMatchesData.filter(m => m.sources && m.sources.length > 0)
        );
        const consolidatedAllMatches = consolidateMatches(cleanAllMatches);
        setAllMatches(consolidatedAllMatches);
        
        console.log(`✅ Loaded ${consolidatedLiveMatches.length} live matches and ${consolidatedAllMatches.length} total matches from all sports`);
        console.log('Live matches by sport:', consolidatedLiveMatches.reduce((acc, match) => {
          const sport = match.sportId || match.category || 'unknown';
          acc[sport] = (acc[sport] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        // Enrich all matches with viewer counts from stream API
        const enrichedAllMatches = await enrichMatchesWithViewers(consolidatedAllMatches);
        
        // For "Popular by Viewers", only show live matches with viewers
        const liveMatchesWithViewers = enrichedAllMatches.filter(m => 
          isMatchLive(m) && 
          (m.viewerCount || 0) > 0
        );
        
        // Sort by viewer count
        const sortedByViewers = liveMatchesWithViewers.sort((a, b) => 
          (b.viewerCount || 0) - (a.viewerCount || 0)
        );
        
        console.log('🔥 Popular live matches with viewers:', sortedByViewers.map(m => ({ 
          id: m.id, 
          title: m.title, 
          viewers: m.viewerCount 
        })));
        
        setMostViewedMatches(sortedByViewers.slice(0, 12));
        
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: "Error",
          description: "Failed to load matches.",
          variant: "destructive",
        });
      } finally {
        setHasInitialized(true);
      }
    };

    loadLiveMatches();
  }, [toast]);

  // Refresh viewer counts every 30 seconds
  useEffect(() => {
    const refreshViewerCounts = async () => {
      if (allMatches.length === 0) return;
      
      try {
        console.log('🔄 Refreshing viewer counts for', allMatches.length, 'matches');
        const enrichedAllMatches = await enrichMatchesWithViewers(allMatches);
        
        // Only show live matches with viewers
        const liveMatchesWithViewers = enrichedAllMatches.filter(m => 
          isMatchLive(m) && 
          (m.viewerCount || 0) > 0
        );
        
        // Sort by viewer count
        const sortedByViewers = liveMatchesWithViewers.sort((a, b) => 
          (b.viewerCount || 0) - (a.viewerCount || 0)
        );
        
        console.log('🔥 Refreshed - Popular live matches with viewers:', sortedByViewers.map(m => ({ 
          id: m.id, 
          title: m.title, 
          viewers: m.viewerCount 
        })));
        
        setMostViewedMatches(sortedByViewers.slice(0, 12));
      } catch (error) {
        console.error('Error refreshing viewer counts:', error);
      }
    };

    const interval = setInterval(refreshViewerCounts, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [allMatches]);

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

  const getSportName = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.name || sportId.charAt(0).toUpperCase() + sportId.slice(1);
  };

  // Filter matches by search term (ended matches already filtered out in data loading)
  const filteredLiveMatches = React.useMemo(() => {
    // Show all live matches (logos are fetched from TheSportsDB asynchronously)
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

  // Filter upcoming matches (not live)
  const filteredUpcomingMatches = React.useMemo(() => {
    // Get non-live matches from allMatches (show all matches, logos fetched from TheSportsDB)
    let upcoming = allMatches.filter(match => !isMatchLive(match));
    
    // Apply search filter if provided
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      upcoming = upcoming.filter(match => {
        return match.title.toLowerCase().includes(lowercaseSearch) || 
          match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
          match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
      });
    }
    
    // Sort by date (earliest first)
    return upcoming.sort((a, b) => a.date - b.date);
  }, [allMatches, searchTerm]);

  // Group live matches by sport
  const liveMatchesBySport = React.useMemo(() => {
    const grouped: { [sportId: string]: Match[] } = {};
    
    filteredLiveMatches.forEach(match => {
      const sportId = match.sportId || match.category || 'unknown';
      if (!grouped[sportId]) {
        grouped[sportId] = [];
      }
      grouped[sportId].push(match);
    });
    
    // Sort matches within each sport by date (newest/most recent first)
    Object.keys(grouped).forEach(sportId => {
      grouped[sportId].sort((a, b) => b.date - a.date);
    });
    
    return grouped;
  }, [filteredLiveMatches]);

  // Group upcoming matches by sport
  const upcomingMatchesBySport = React.useMemo(() => {
    const grouped: { [sportId: string]: Match[] } = {};
    
    filteredUpcomingMatches.forEach(match => {
      const sportId = match.sportId || match.category || 'unknown';
      if (!grouped[sportId]) {
        grouped[sportId] = [];
      }
      grouped[sportId].push(match);
    });
    
    // Sort matches within each sport by date (earliest first for upcoming)
    Object.keys(grouped).forEach(sportId => {
      grouped[sportId].sort((a, b) => a.date - b.date);
    });
    
    return grouped;
  }, [filteredUpcomingMatches]);

  // Sort sports by priority
  const sortedLiveSports = React.useMemo(() => 
    Object.entries(liveMatchesBySport).sort(([sportIdA], [sportIdB]) => {
      return getSportPriority(sportIdA) - getSportPriority(sportIdB);
    }), [liveMatchesBySport]);

  const sortedUpcomingSports = React.useMemo(() => 
    Object.entries(upcomingMatchesBySport).sort(([sportIdA], [sportIdB]) => {
      return getSportPriority(sportIdA) - getSportPriority(sportIdB);
    }), [upcomingMatchesBySport]);

  const hasLiveMatches = filteredLiveMatches.length > 0;
  const hasUpcomingMatches = filteredUpcomingMatches.length > 0;

  // Show skeleton only during initial load
  if (!hasInitialized) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-[280px] bg-card rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Show TV channels when no matches available
  if (!hasLiveMatches && !hasUpcomingMatches) {
    return <AllChannelsGrid />;
  }

  return (
    <div className="space-y-8">
      {/* Live TV Channels - Always First */}
      <AllChannelsGrid />

      {/* Live Matches Sections */}
      {hasLiveMatches && (
        <>
          <div className="border-t border-[#343a4d] pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Sports</h2>
          </div>
          {sortedLiveSports.map(([sportId, matches]) => (
            <div key={sportId} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {getSportName(sportId)}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white animate-pulse">
                    LIVE
                  </span>
                </h3>
                <span className="text-sm text-gray-400">
                  {matches.length} live match{matches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 auto-rows-fr">
                {matches.map((match) => (
                  <div key={`live-${match.sportId || sportId}-${match.id}`} className="h-full">
                    <MatchCard
                      match={match}
                      sportId={match.sportId || sportId}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Upcoming Matches Sections */}
      {hasUpcomingMatches && (
        <>
          <div className="border-t border-[#343a4d] pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Matches</h2>
          </div>
          {sortedUpcomingSports.map(([sportId, matches]) => (
            <div key={`upcoming-${sportId}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {getSportName(sportId)}
                </h3>
                <span className="text-sm text-gray-400">
                  {matches.length} upcoming match{matches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 auto-rows-fr">
                {matches.slice(0, 12).map((match) => (
                  <div key={`upcoming-${match.sportId || sportId}-${match.id}`} className="h-full">
                    <MatchCard
                      match={match}
                      sportId={match.sportId || sportId}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AllSportsLiveMatches;