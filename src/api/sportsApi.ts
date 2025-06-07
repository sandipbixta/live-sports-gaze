
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

// New interface for the streams API response
interface StreamsApiResponse {
  success: boolean;
  timestamp: number;
  READ_ME: string;
  performance: number;
  streams: StreamCategory[];
}

interface StreamCategory {
  category: string;
  id: number;
  always_live: number;
  streams: StreamItem[];
}

interface StreamItem {
  id: number;
  name: string;
  tag: string;
  poster: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number;
  category_name: string;
  iframe?: string;
  allowpaststreams: number;
}

// Updated fetchSports to use the new API
export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE}/streams`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch streams');
    
    const data: StreamsApiResponse = await response.json();
    
    if (!data.success || !data.streams) {
      throw new Error('Invalid API response');
    }
    
    // Transform stream categories into sports
    const sports: Sport[] = data.streams.map(category => ({
      id: category.id.toString(),
      name: category.category
    }));
    
    setCachedData(cacheKey, sports);
    return sports;
  } catch (error) {
    console.error('Error fetching sports:', error);
    
    // Fallback sports data
    const fallbackSports: Sport[] = [
      { id: '1', name: 'Football' },
      { id: '2', name: 'Basketball' },
      { id: '3', name: 'Tennis' },
      { id: '4', name: 'Baseball' },
      { id: '5', name: 'Hockey' },
      { id: '6', name: 'Soccer' },
      { id: '7', name: 'Combat Sports' }
    ];
    
    setCachedData(cacheKey, fallbackSports);
    return fallbackSports;
  }
};

// Updated fetchMatches to use the new API
export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE}/streams`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch streams');
    
    const data: StreamsApiResponse = await response.json();
    
    if (!data.success || !data.streams) {
      throw new Error('Invalid API response');
    }
    
    // Find the category that matches the sportId
    const category = data.streams.find(cat => cat.id.toString() === sportId);
    
    if (!category) {
      console.warn(`No category found for sportId: ${sportId}`);
      return [];
    }
    
    // Transform stream items into matches
    const matches: Match[] = category.streams.map(stream => ({
      id: stream.id.toString(),
      title: stream.name,
      date: new Date(stream.starts_at * 1000).toISOString(),
      teams: parseTeamsFromName(stream.name),
      sources: [{
        source: 'stream',
        id: stream.id.toString()
      }],
      sportId: sportId
    }));
    
    setCachedData(cacheKey, matches);
    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

// Helper function to parse team names from stream name
const parseTeamsFromName = (name: string) => {
  // Try to detect "Team A vs Team B" or "Team A - Team B" patterns
  const vsMatch = name.match(/^(.+?)\s+(?:vs|v|-)?\s+(.+?)$/i);
  if (vsMatch && vsMatch.length === 3) {
    return {
      home: { name: vsMatch[1].trim() },
      away: { name: vsMatch[2].trim() }
    };
  }
  return undefined;
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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // First, get the stream details from the streams API
    const response = await fetch(`${API_BASE}/streams`, {
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
    
    const data: StreamsApiResponse = await response.json();
    console.log('Streams API response:', data);
    
    if (!data.success || !data.streams) {
      throw new Error('Invalid streams API response');
    }
    
    // Find the specific stream by id
    let targetStream: StreamItem | null = null;
    
    for (const category of data.streams) {
      const foundStream = category.streams.find(stream => stream.id.toString() === id);
      if (foundStream) {
        targetStream = foundStream;
        break;
      }
    }
    
    if (!targetStream) {
      throw new Error('Stream not found');
    }
    
    // If iframe is available, use it directly
    if (targetStream.iframe) {
      const result: Stream = {
        id: targetStream.id.toString(),
        streamNo: 1,
        language: 'en',
        hd: true,
        embedUrl: targetStream.iframe,
        source: 'iframe'
      };
      setCachedData(cacheKey, result);
      return result;
    }
    
    // If no iframe, try the old endpoint as fallback
    const fallbackResponse = await fetch(`${API_BASE}/stream/${source}/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      console.log('Fallback stream API response:', fallbackData);
      
      // Handle response format
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        const validStreams = fallbackData.filter(stream => isValidStreamUrl(stream.embedUrl));
        
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
      } else if (fallbackData && typeof fallbackData === 'object' && fallbackData.embedUrl) {
        if (isValidStreamUrl(fallbackData.embedUrl)) {
          const result = { ...fallbackData, embedUrl: ensureValidEmbedUrl(fallbackData.embedUrl) };
          setCachedData(cacheKey, result);
          return result;
        }
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
