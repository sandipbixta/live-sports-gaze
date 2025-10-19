import { useState, useEffect } from 'react';
import { Match } from '@/types/sports';
import { enrichMatchesWithViewers } from '@/services/viewerCountService';

/**
 * Hook to automatically enrich matches with viewer counts
 * This will fetch viewer counts from the stream API and mark matches as popular
 */
export const useEnrichedMatches = (matches: Match[]) => {
  const [enrichedMatches, setEnrichedMatches] = useState<Match[]>(matches);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const enrichMatches = async () => {
      if (matches.length === 0) {
        setEnrichedMatches([]);
        return;
      }

      setLoading(true);
      
      try {
        const enriched = await enrichMatchesWithViewers(matches);
        
        if (isMounted) {
          // Sort: live popular matches first, then other live matches, then upcoming
          const sorted = [...enriched].sort((a, b) => {
            const aLive = a.date <= Date.now();
            const bLive = b.date <= Date.now();
            const aPopular = a.popular && a.viewerCount !== undefined;
            const bPopular = b.popular && b.viewerCount !== undefined;

            // Priority 1: Live popular matches with viewer counts
            if (aLive && aPopular && !bPopular) return -1;
            if (bLive && bPopular && !aPopular) return 1;

            // Priority 2: Sort popular matches by viewer count
            if (aLive && bLive && aPopular && bPopular) {
              return (b.viewerCount || 0) - (a.viewerCount || 0);
            }

            // Priority 3: Live matches
            if (aLive && !bLive) return -1;
            if (!aLive && bLive) return 1;

            // Priority 4: Date
            return (a.date || 0) - (b.date || 0);
          });

          setEnrichedMatches(sorted);
          
          // Log popular matches for debugging
          const popularMatches = sorted.filter(m => m.popular && m.viewerCount);
          if (popularMatches.length > 0) {
            console.log(`🔥 ${popularMatches.length} popular matches with viewers:`, 
              popularMatches.map(m => ({ title: m.title, viewers: m.viewerCount }))
            );
          }
        }
      } catch (error) {
        console.error('Error enriching matches with viewer counts:', error);
        if (isMounted) {
          setEnrichedMatches(matches);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    enrichMatches();

    // Refresh viewer counts every 2 minutes
    const interval = setInterval(enrichMatches, 2 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [matches]);

  return { enrichedMatches, loading };
};
