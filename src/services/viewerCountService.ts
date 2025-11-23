import { Match } from '@/types/sports';

const API_BASE = 'https://streamed.pk/api';

// Cache for viewer counts to minimize API calls (5 minute cache)
interface ViewerCountCache {
  count: number;
  timestamp: number;
}

const viewerCountCache = new Map<string, ViewerCountCache>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// LocalStorage cache key
const LOCAL_STORAGE_KEY = 'viewer_counts_cache';

// Load cache from localStorage on init
const loadCacheFromStorage = (): Map<string, ViewerCountCache> => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.warn('Failed to load viewer count cache:', error);
  }
  return new Map();
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheObj = Object.fromEntries(viewerCountCache);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheObj));
  } catch (error) {
    console.warn('Failed to save viewer count cache:', error);
  }
};

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
 */
export const fetchViewerCountFromSource = async (
  source: string,
  id: string
): Promise<number | null> => {
  try {
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`Stream API returned ${response.status} for ${source}/${id}`);
      return null;
    }

    const data = await response.json();
    
    // Check if viewers field exists and is valid
    if (data && typeof data.viewers === 'number') {
      return validateViewerCount(data.viewers);
    }
    
    // If it's an array, check the first stream
    if (Array.isArray(data) && data.length > 0 && typeof data[0].viewers === 'number') {
      return validateViewerCount(data[0].viewers);
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch viewer count for ${source}/${id}:`, error);
    return null;
  }
};

/**
 * Fetch viewer count for a match (tries all sources)
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

  // Try all sources and sum up viewer counts
  if (!match.sources || match.sources.length === 0) {
    return null;
  }

  try {
    const viewerPromises = match.sources.map(source =>
      fetchViewerCountFromSource(source.source, source.id)
    );

    const results = await Promise.all(viewerPromises);
    const validCounts = results.filter((count): count is number => count !== null);

    if (validCounts.length === 0) {
      return null;
    }

    // Sum up all valid viewer counts
    const totalViewers = validCounts.reduce((sum, count) => sum + count, 0);

    // Cache the result
    viewerCountCache.set(cacheKey, {
      count: totalViewers,
      timestamp: Date.now()
    });

    return totalViewers;
  } catch (error) {
    console.error(`Error fetching viewer count for match ${match.id}:`, error);
    return null;
  }
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
  
  // Fetch in batches of 5 to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < liveMatches.length; i += batchSize) {
    const batch = liveMatches.slice(i, i + batchSize);
    
    const promises = batch.map(async (match) => {
      const count = await fetchMatchViewerCount(match);
      if (count !== null) {
        viewerCounts.set(match.id, count);
      }
    });
    
    await Promise.all(promises);
  }
  
  return viewerCounts;
};

/**
 * Enrich matches with viewer counts and mark popular ones
 */
export const enrichMatchesWithViewers = async (matches: Match[]): Promise<Match[]> => {
  // Load cache from storage on first call
  if (viewerCountCache.size === 0) {
    const storedCache = loadCacheFromStorage();
    storedCache.forEach((value, key) => {
      viewerCountCache.set(key, value);
    });
  }

  const viewerCounts = await fetchBatchViewerCounts(matches);
  
  // Save updated cache to storage
  saveCacheToStorage();
  
  return matches.map(match => {
    const viewerCount = viewerCounts.get(match.id);
    
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
