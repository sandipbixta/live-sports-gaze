import { supabase } from "@/integrations/supabase/client";
import { Match } from '../types/sports';

// Cache for viewer counts to reduce API calls
const viewerCountCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds cache

export const fetchMatchViewerCounts = async (matchIds: string[]): Promise<Map<string, number>> => {
  const viewerCounts = new Map<string, number>();
  const now = Date.now();
  const idsToFetch: string[] = [];
  
  // Check cache first
  matchIds.forEach(matchId => {
    const cached = viewerCountCache.get(matchId);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      viewerCounts.set(matchId, cached.count);
    } else {
      idsToFetch.push(matchId);
    }
  });

  // Only fetch uncached IDs
  if (idsToFetch.length === 0) {
    return viewerCounts;
  }

  try {
    // Batch requests in groups of 10 to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < idsToFetch.length; i += batchSize) {
      const batch = idsToFetch.slice(i, i + batchSize);
      
      const promises = batch.map(async (matchId) => {
        try {
          const { data: count, error: countError } = await supabase
            .rpc('get_viewer_count', { match_id_param: matchId });
          
          if (!countError && count !== null) {
            viewerCounts.set(matchId, count);
            viewerCountCache.set(matchId, { count, timestamp: now });
          }
        } catch (err) {
          console.error(`Error fetching viewer count for match ${matchId}:`, err);
        }
      });

      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Error in fetchMatchViewerCounts:', error);
  }

  return viewerCounts;
};

export const enrichMatchesWithViewerCounts = async (matches: Match[]): Promise<Match[]> => {
  if (matches.length === 0) return matches;

  const matchIds = matches.map(match => match.id);
  const viewerCounts = await fetchMatchViewerCounts(matchIds);

  return matches.map(match => ({
    ...match,
    viewerCount: viewerCounts.get(match.id) || 0
  }));
};