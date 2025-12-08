
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source, Sport } from '../types/sports';
import { fetchMatches, fetchStream, fetchSports, fetchLiveMatches, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';
import { fetchAllCdnLiveEvents, CdnLiveMatch } from '../services/cdnLiveService';

export const useLiveMatches = () => {
  const { toast } = useToast();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLiveContent = useCallback(async () => {
    try {
      console.log('Fetching live matches...');
      
      // Fetch sports, football data, and CDN-Live events in parallel
      const [sportsData, initialFootballMatches, cdnLiveMatches] = await Promise.all([
        fetchSports(),
        fetchMatches('football'),
        fetchAllCdnLiveEvents().catch(err => {
          console.warn('CDN-Live API failed, continuing without it:', err);
          return [] as CdnLiveMatch[];
        })
      ]);
      
      setSports(sportsData);
      
      // Process CDN-Live matches
      console.log(`CDN-Live returned ${cdnLiveMatches.length} matches`);
      
      // Merge CDN-Live matches with existing (avoid duplicates by title similarity)
      const mergeMatches = (existing: Match[], cdnMatches: CdnLiveMatch[]): Match[] => {
        const merged = [...existing];
        
        for (const cdnMatch of cdnMatches) {
          // Check if similar match already exists (by team names)
          const isDuplicate = existing.some(m => {
            const existingTitle = m.title.toLowerCase();
            const cdnTitle = cdnMatch.title.toLowerCase();
            const homeTeam = cdnMatch.teams?.home?.name?.toLowerCase() || '';
            const awayTeam = cdnMatch.teams?.away?.name?.toLowerCase() || '';
            
            return existingTitle.includes(homeTeam) && existingTitle.includes(awayTeam);
          });
          
          if (!isDuplicate) {
            merged.push(cdnMatch);
          }
        }
        
        return merged;
      };
      
      // Process and display football matches instantly
      const initialMatchesWithSources = initialFootballMatches.filter(m => m.sources && m.sources.length > 0);
      const initialCleanMatches = filterCleanMatches(initialMatchesWithSources);
      const footballWithSportId = initialCleanMatches.map(m => ({ ...m, sportId: 'football' }));
      
      // Merge with CDN-Live football/soccer matches
      const cdnFootball = cdnLiveMatches.filter(m => m.category === 'football');
      const mergedFootball = mergeMatches(footballWithSportId, cdnFootball);
      const initialConsolidatedMatches = consolidateMatches(mergedFootball);
      
      const initialLive = initialConsolidatedMatches.filter(match => {
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
      
      const initialUpcoming = initialConsolidatedMatches.filter(match => 
        !initialLive.some(liveMatch => liveMatch.id === match.id)
      );
      
      // Display immediately - NO loading state blocking
      setAllMatches(initialConsolidatedMatches);
      setLiveMatches(initialLive);
      setUpcomingMatches(initialUpcoming);
      setLoading(false);
      console.log('Football matches displayed instantly');
      
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
      const finalFootballMatches = await fetchMatches('football');
      const allFetchedMatches = [...finalFootballMatches.map(m => ({ ...m, sportId: 'football' })), ...allOtherMatches];
      
      // Merge all CDN-Live matches
      const allMergedMatches = mergeMatches(allFetchedMatches, cdnLiveMatches);
      
      // Final processing with all matches
      const finalMatchesWithSources = allMergedMatches.filter(m => m.sources && m.sources.length > 0);
      const finalCleanMatches = filterCleanMatches(finalMatchesWithSources);
      const finalConsolidatedMatches = consolidateMatches(finalCleanMatches);
      
      const finalLive = finalConsolidatedMatches.filter(match => {
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
      
      const finalUpcoming = finalConsolidatedMatches.filter(match => 
        !finalLive.some(liveMatch => liveMatch.id === match.id)
      );
      
      console.log('All matches loaded - Live:', finalLive.length, 'Upcoming:', finalUpcoming.length, 'CDN-Live contributed:', cdnLiveMatches.length);
      
      // Update with complete data
      setAllMatches(finalConsolidatedMatches);
      setLiveMatches(finalLive);
      setUpcomingMatches(finalUpcoming);
      
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
