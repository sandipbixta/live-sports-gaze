
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source, Sport } from '../types/sports';
import { fetchMatches, fetchStream, fetchSports, fetchLiveMatches, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';

export const useLiveMatches = () => {
  const { toast } = useToast();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLiveContent = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching live matches...');
      
      // Fetch sports data first (fast)
      const sportsData = await fetchSports();
      setSports(sportsData);
      
      // Fetch only football first for instant display
      console.log('Fetching football matches for instant display...');
      try {
        const footballMatches = await fetchMatches('football');
        const matchesWithSources = footballMatches.filter(m => m.sources && m.sources.length > 0);
        const cleanMatches = filterCleanMatches(matchesWithSources);
        const consolidatedMatches = consolidateMatches(cleanMatches.map(m => ({ ...m, sportId: 'football' })));
        
        const live = consolidatedMatches.filter(match => {
          const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
          const now = new Date().getTime();
          const sixHoursInMs = 6 * 60 * 60 * 1000;
          const oneHourInMs = 60 * 60 * 1000;
          
          return match.sources && 
                 match.sources.length > 0 && 
                 matchTime - now < oneHourInMs && 
                 now - matchTime < sixHoursInMs;
        }).sort((a, b) => {
          const aTime = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
          const bTime = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
          return bTime - aTime;
        });
        
        const upcoming = consolidatedMatches.filter(match => 
          !live.some(liveMatch => liveMatch.id === match.id)
        );
        
        // Show football matches immediately
        setAllMatches(consolidatedMatches);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setLoading(false);
        console.log('Football matches displayed instantly');
      } catch (error) {
        console.error('Error fetching football matches:', error);
      }
      
      // Fetch remaining sports in background
      const otherSports = ['basketball', 'tennis', 'cricket', 'hockey', 'fight', 'baseball', 'rugby'];
      
      const allSportPromises = otherSports.map(async (sportId) => {
        try {
          const matches = await fetchMatches(sportId);
          return matches.map(match => ({ ...match, sportId }));
        } catch (error) {
          console.error(`Error fetching matches for sport ${sportId}:`, error);
          return [];
        }
      });
      
      const results = await Promise.all(allSportPromises);
      const allOtherMatches = results.flat();
      
      // Get football matches again to merge with others
      const footballMatches = await fetchMatches('football');
      const allFetchedMatches = [...footballMatches.map(m => ({ ...m, sportId: 'football' })), ...allOtherMatches];
      
      // Final processing with all matches
      const matchesWithSources = allFetchedMatches.filter(m => m.sources && m.sources.length > 0);
      const cleanMatches = filterCleanMatches(matchesWithSources);
      const consolidatedMatches = consolidateMatches(cleanMatches);
      
      const live = consolidatedMatches.filter(match => {
        const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
        const now = new Date().getTime();
        const sixHoursInMs = 6 * 60 * 60 * 1000;
        const oneHourInMs = 60 * 60 * 1000;
        
        return match.sources && 
               match.sources.length > 0 && 
               matchTime - now < oneHourInMs && 
               now - matchTime < sixHoursInMs;
      }).sort((a, b) => {
        const aTime = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
        const bTime = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
        return bTime - aTime;
      });
      
      const upcoming = consolidatedMatches.filter(match => 
        !live.some(liveMatch => liveMatch.id === match.id)
      );
      
      console.log('All matches loaded - Live:', live.length, 'Upcoming:', upcoming.length);
      
      // Update with complete data
      setAllMatches(consolidatedMatches);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
      
    } catch (error) {
      console.error('Error fetching live content:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, retryCount]);

  useEffect(() => {
    fetchLiveContent();
  }, [fetchLiveContent]);

  const handleRetryLoading = useCallback(() => {
    setLoading(true);
    setRetryCount(prev => prev + 1);
    toast({
      title: "Refreshing",
      description: "Loading latest matches...",
    });
  }, [toast]);

  return {
    allMatches,
    liveMatches,
    upcomingMatches,
    sports,
    loading,
    handleRetryLoading
  };
};
