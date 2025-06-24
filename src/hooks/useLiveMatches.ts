
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source, Sport } from '../types/sports';
import { fetchMatches, fetchStream, fetchSports } from '../api/sportsApi';
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
      // Get sports data to show proper sport names
      const sportsData = await fetchSports();
      setSports(sportsData);
      console.log('Sports data:', sportsData);
      
      // Fetch from multiple sports to find live matches including wrestling/combat sports
      const sportIds = ['1', '2', '3', '4', 'football', 'basketball', 'hockey', 'tennis', 'baseball', 'cricket', 'rugby', 'golf', 'fight', 'wrestling', 'ufc', 'boxing'];
      let allFetchedMatches: Match[] = [];
      
      for (const sportId of sportIds) {
        console.log(`Fetching matches for sport ID: ${sportId}`);
        try {
          const matches = await fetchMatches(sportId);
          console.log(`Matches for ${sportId}:`, matches ? matches.length : 0);
          
          // Add sport ID as a property to each match for reference
          const matchesWithSportId = matches.map(match => ({
            ...match,
            sportId
          }));
          allFetchedMatches = [...allFetchedMatches, ...matchesWithSportId];
        } catch (error) {
          console.error(`Error fetching matches for sport ${sportId}:`, error);
        }
      }
      
      console.log('All matches before filtering:', allFetchedMatches.length);
      
      // Filter out advertisement matches and consolidate duplicates
      const cleanMatches = filterCleanMatches(allFetchedMatches);
      const consolidatedMatches = consolidateMatches(cleanMatches);
      
      console.log('Matches after consolidation:', consolidatedMatches.length);
      
      // Separate matches into live and upcoming using the extended criteria
      const live = consolidatedMatches.filter(match => {
        const matchTime = new Date(match.date).getTime();
        const now = new Date().getTime();
        const sixHoursInMs = 6 * 60 * 60 * 1000;
        const oneHourInMs = 60 * 60 * 1000;
        
        return match.sources && 
               match.sources.length > 0 && 
               matchTime - now < oneHourInMs && 
               now - matchTime < sixHoursInMs;
      });
      
      const upcoming = consolidatedMatches.filter(match => 
        !live.some(liveMatch => liveMatch.id === match.id)
      );
      
      console.log('Live matches:', live.length);
      console.log('Upcoming matches:', upcoming.length);
      
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
    } finally {
      setLoading(false);
    }
  }, [toast, retryCount]);

  useEffect(() => {
    fetchLiveContent();
  }, [fetchLiveContent]);

  const handleRetryLoading = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    allMatches,
    liveMatches,
    upcomingMatches,
    sports,
    loading,
    handleRetryLoading
  };
};
