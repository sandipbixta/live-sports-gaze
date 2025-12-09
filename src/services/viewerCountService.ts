import { Match } from '@/types/sports';

const API_BASE = 'https://api.cdn-live.tv/api/v1/vip/damitv';

// Cache for viewer counts to minimize API calls (5 minute cache)
interface ViewerCountCache {
  count: number;
  timestamp: number;
}

const viewerCountCache = new Map<string, ViewerCountCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a match is currently live
 */
export const isMatchLive = (match: Match): boolean => {
  if (!match.date) return false;
  return new Date(match.date).getTime() <= new Date().getTime();
};

/**
 * Validate viewer count from API response
 */
const validateViewerCount = (viewers: any): number | null => {
  if (typeof viewers !== 'number' || viewers < 0 || !isFinite(viewers)) {
    return null;
  }
  return Math.floor(viewers);
};

/**
 * Fetch viewer count from stream API for a specific source
 * Note: With the new API, viewer counts are typically embedded in the event data
 */
export const fetchViewerCountFromSource = async (
  source: string,
  id: string
): Promise<number | null> => {
  try {
    // The new API doesn't have a separate stream endpoint for viewer counts
    // Viewer counts are embedded in the events data
    return null;
  } catch (error) {
    console.warn(`Failed to fetch viewer count for ${source}/${id}:`, error);
    return null;
  }
};

/**
 * Fetch viewer count for a match (from match data)
 */
export const fetchMatchViewerCount = async (match: Match): Promise<number | null> => {
  // Only fetch for live matches
  if (!isMatchLive(match)) {
    return null;
  }

  // Check cache first
  const cacheKey = match.id;
  const cached = viewerCountCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.count;
  }

  // With the new API, viewer counts should be in the match data
  if (match.viewerCount !== undefined) {
    viewerCountCache.set(cacheKey, {
      count: match.viewerCount,
      timestamp: Date.now()
    });
    return match.viewerCount;
  }

  return null;
};

/**
 * Fetch viewer counts for multiple matches in batch
 */
export const fetchBatchViewerCounts = async (
  matches: Match[]
): Promise<Map<string, number>> => {
  const viewerCounts = new Map<string, number>();
  
  // Filter to only live matches
  const liveMatches = matches.filter(isMatchLive);
  
  console.log(`🔄 Getting viewer counts for ${liveMatches.length} matches`);
  
  // With the new API, viewer counts are embedded in match data
  liveMatches.forEach(match => {
    if (match.viewerCount !== undefined && match.viewerCount > 0) {
      viewerCounts.set(match.id, match.viewerCount);
    }
  });
  
  console.log(`✅ Found ${viewerCounts.size} matches with viewer data`);
  
  return viewerCounts;
};

/**
 * Enrich matches with viewer counts and mark popular ones
 */
export const enrichMatchesWithViewers = async (matches: Match[]): Promise<Match[]> => {
  const viewerCounts = await fetchBatchViewerCounts(matches);
  
  return matches.map(match => {
    const viewerCount = viewerCounts.get(match.id) || match.viewerCount;
    
    return {
      ...match,
      viewerCount: viewerCount ?? undefined,
      // Mark as popular if it has valid viewer count
      popular: viewerCount !== undefined ? true : match.popular
    };
  });
};

/**
 * Format viewer count with K/M suffixes
 */
export const formatViewerCount = (count: number, rounded: boolean = false): string => {
  if (rounded) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
  }
  return count.toLocaleString();
};

/**
 * Clear cache for a specific match or all
 */
export const clearViewerCountCache = (matchId?: string) => {
  if (matchId) {
    viewerCountCache.delete(matchId);
  } else {
    viewerCountCache.clear();
  }
};
