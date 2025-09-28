
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
      console.log('Sports data:', sportsData);
      
      // Prioritize most popular sports for faster initial load
      const prioritySports = ['football', 'basketball', 'tennis', 'fight'];
      const secondarySports = ['hockey', 'baseball', 'cricket', 'rugby'];
      
      let allFetchedMatches: Match[] = [];
      
      // Fetch priority sports in parallel for faster loading
      console.log('Fetching priority sports...');
      const priorityPromises = prioritySports.map(async (sportId) => {
        try {
          console.log(`Fetching matches for priority sport: ${sportId}`);
          const matches = await fetchMatches(sportId);
          console.log(`Matches for ${sportId}:`, matches ? matches.length : 0);
          return matches.map(match => ({ ...match, sportId }));
        } catch (error) {
          console.error(`Error fetching matches for sport ${sportId}:`, error);
          return [];
        }
      });
      
      // Wait for priority sports (should be fast)
      const priorityResults = await Promise.all(priorityPromises);
      const priorityMatches = priorityResults.flat();
      
      // Process and display priority matches immediately
      if (priorityMatches.length > 0) {
        const cleanMatches = filterCleanMatches(priorityMatches);
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
        // Sort live matches by start time - most recent live matches first
        const aTime = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
        const bTime = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
        return bTime - aTime; // Descending order (newest first)
      });
        
        const upcoming = consolidatedMatches.filter(match => 
          !live.some(liveMatch => liveMatch.id === match.id)
        );
        
        // Update state with priority matches
        setAllMatches(consolidatedMatches);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setLoading(false); // Stop loading spinner early
        
        console.log('Priority matches loaded - Live:', live.length, 'Upcoming:', upcoming.length);
      }
      
      // Fetch secondary sports in background
      console.log('Fetching secondary sports in background...');
      const secondaryPromises = secondarySports.map(async (sportId) => {
        try {
          const matches = await fetchMatches(sportId);
          return matches.map(match => ({ ...match, sportId }));
        } catch (error) {
          console.error(`Error fetching matches for sport ${sportId}:`, error);
          return [];
        }
      });
      
      // Wait for secondary sports
      const secondaryResults = await Promise.all(secondaryPromises);
      const secondaryMatches = secondaryResults.flat();
      
      // Combine all results
      allFetchedMatches = [...priorityMatches, ...secondaryMatches];
      
      console.log('All matches before filtering:', allFetchedMatches.length);
      
      // Final processing with all matches
      const cleanMatches = filterCleanMatches(allFetchedMatches);
      const consolidatedMatches = consolidateMatches(cleanMatches);
      
      console.log('Matches after consolidation:', consolidatedMatches.length);
      
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
        // Sort live matches by start time - most recent live matches first
        const aTime = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
        const bTime = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
        return bTime - aTime; // Descending order (newest first)
      });
      
      const upcoming = consolidatedMatches.filter(match => 
        !live.some(liveMatch => liveMatch.id === match.id)
      );
      
      console.log('Final results - Live matches:', live.length);
      console.log('Final results - Upcoming matches:', upcoming.length);
      
      // Update with final complete data
      setAllMatches(consolidatedMatches);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
      
    } catch (error) {
      console.error('Error fetching live content:', error);
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
