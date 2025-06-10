
import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.su/api';

// Cache for API responses to avoid repeated calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE}/sports`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch sports');
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching sports:', error);
    return [];
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(`${API_BASE}/matches/${sportId}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch matches');
    const matches = await response.json();
    setCachedData(cacheKey, matches);
    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  const cacheKey = `match-${sportId}-${matchId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // First try to get from cached matches
    const cachedMatches = getCachedData(`matches-${sportId}`);
    if (cachedMatches) {
      const match = cachedMatches.find((m: Match) => m.id === matchId);
      if (match) {
        setCachedData(cacheKey, match);
        return match;
      }
    }

    // Fallback to fetching all matches
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    setCachedData(cacheKey, match);
    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string, streamNo?: number): Promise<Stream | Stream[]> => {
  const cacheKey = `stream-${source}-${id}-${streamNo || 'all'}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`Fetching stream: source=${source}, id=${id}, streamNo=${streamNo}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Stream API response:', data);
    
    // Handle response format
    if (Array.isArray(data) && data.length > 0) {
      const validStreams = data.filter(stream => isValidStreamUrl(stream.embedUrl));
      
      if (streamNo !== undefined) {
        const specificStream = validStreams.find(stream => stream.streamNo === streamNo);
        if (specificStream) {
          const result = { ...specificStream, embedUrl: ensureValidEmbedUrl(specificStream.embedUrl) };
          setCachedData(cacheKey, result);
          return result;
        }
      }
      
      const result = validStreams.map(stream => ({
        ...stream,
        embedUrl: ensureValidEmbedUrl(stream.embedUrl)
      }));
      setCachedData(cacheKey, result);
      return result;
    } else if (data && typeof data === 'object' && data.embedUrl) {
      if (isValidStreamUrl(data.embedUrl)) {
        const result = { ...data, embedUrl: ensureValidEmbedUrl(data.embedUrl) };
        setCachedData(cacheKey, result);
        return result;
      }
    }
    
    throw new Error('No valid streams found');
    
  } catch (error) {
    console.error('Error in fetchStream:', error);
    throw error;
  }
};

// Helper function to check if URL is valid
function isValidStreamUrl(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  
  const invalidDomains = ['youtube.com', 'youtu.be', 'demo', 'example.com'];
  return !invalidDomains.some(domain => url.includes(domain));
}

// Helper function to ensure embed URL is valid
function ensureValidEmbedUrl(url: string): string {
  if (url && url.startsWith('http') && isValidStreamUrl(url)) {
    return url;
  }
  throw new Error('Invalid stream URL');
}
