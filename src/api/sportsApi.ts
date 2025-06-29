
import { Sport, Match, Stream } from '../types/sports';

// Multiple API endpoints with different protocols and domains
const API_ENDPOINTS = [
  'https://streamed.su/api',
  'https://api.streamed.su',
  'https://backup.streamed.su/api',
  'https://cors-anywhere.herokuapp.com/https://streamed.su/api',
  'https://api.allorigins.win/raw?url=https://streamed.su/api'
];

// Mock data for when APIs are down
const MOCK_SPORTS = [
  { id: '1', name: 'Football', slug: 'football' },
  { id: '2', name: 'Basketball', slug: 'basketball' },
  { id: '3', name: 'Tennis', slug: 'tennis' },
  { id: '4', name: 'Hockey', slug: 'hockey' },
  { id: '5', name: 'Baseball', slug: 'baseball' }
];

const MOCK_MATCHES = [
  {
    id: 'mock-1',
    title: 'Sample Match 1',
    date: new Date().toISOString(),
    sources: [
      { source: 'sample', id: 'test1' }
    ]
  },
  {
    id: 'mock-2', 
    title: 'Sample Match 2',
    date: new Date().toISOString(),
    sources: [
      { source: 'sample', id: 'test2' }
    ]
  }
];

const MOCK_STREAM = {
  id: 'mock-stream',
  embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  source: 'mock',
  language: 'English',
  hd: true,
  streamNo: 1
};

let currentEndpointIndex = 0;
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit for ${key}`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Fast fetch with aggressive timeout
const fetchWithTimeout = async (url: string, timeout: number = 3000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Try multiple endpoints with immediate fallback
const tryMultipleEndpoints = async (path: string, useMockOnFailure: boolean = true): Promise<any> => {
  console.log(`🔄 Trying to fetch: ${path}`);
  
  // Try all endpoints in parallel for speed
  const promises = API_ENDPOINTS.map(async (endpoint, index) => {
    try {
      const url = endpoint.includes('allorigins') 
        ? `${endpoint}${encodeURIComponent(`https://streamed.su/api${path}`)}`
        : `${endpoint}${path}`;
      
      console.log(`📡 Attempting: ${url}`);
      const response = await fetchWithTimeout(url, 2000); // Very fast timeout
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Success with endpoint ${index + 1}:`, url);
      currentEndpointIndex = index;
      return data;
    } catch (error) {
      console.warn(`❌ Endpoint ${index + 1} failed:`, error);
      throw error;
    }
  });

  // Wait for first successful response
  try {
    const result = await Promise.any(promises);
    return result;
  } catch (error) {
    console.error('❌ All endpoints failed:', error);
    
    if (useMockOnFailure) {
      console.log('🔄 Using mock data as fallback');
      if (path === '/sports') return MOCK_SPORTS;
      if (path.includes('/matches/')) return MOCK_MATCHES;
      if (path.includes('/stream/')) return MOCK_STREAM;
    }
    
    throw new Error('All API endpoints failed and no mock data available');
  }
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log('🏃 Fetching sports data...');
    const data = await tryMultipleEndpoints('/sports');
    const validData = Array.isArray(data) ? data : MOCK_SPORTS;
    setCachedData(cacheKey, validData);
    console.log(`✅ Sports loaded: ${validData.length} sports`);
    return validData;
  } catch (error) {
    console.error('❌ Sports fetch failed:', error);
    return MOCK_SPORTS;
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`🏃 Fetching matches for sport: ${sportId}`);
    const matches = await tryMultipleEndpoints(`/matches/${sportId}`);
    const validMatches = Array.isArray(matches) ? matches : MOCK_MATCHES;
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Matches loaded: ${validMatches.length} matches`);
    return validMatches;
  } catch (error) {
    console.error(`❌ Matches fetch failed for ${sportId}:`, error);
    return MOCK_MATCHES;
  }
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  const cacheKey = `match-${sportId}-${matchId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`🏃 Fetching match: ${sportId}/${matchId}`);
    
    // Try to get from matches first
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      setCachedData(cacheKey, match);
      console.log(`✅ Match found: ${match.title}`);
      return match;
    }
    
    throw new Error('Match not found');
  } catch (error) {
    console.error(`❌ Match fetch failed:`, error);
    // Return a mock match
    const mockMatch = {
      ...MOCK_MATCHES[0],
      id: matchId,
      title: `Match ${matchId}`
    };
    return mockMatch as Match;
  }
};

export const fetchStream = async (source: string, id: string, streamNo?: number): Promise<Stream | Stream[]> => {
  const cacheKey = `stream-${source}-${id}-${streamNo || 'all'}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`🎬 Fetching stream: ${source}/${id}${streamNo ? `/${streamNo}` : ''}`);
    
    const data = await tryMultipleEndpoints(`/stream/${source}/${id}`, false);
    
    if (Array.isArray(data) && data.length > 0) {
      const validStreams = data.filter(stream => 
        stream.embedUrl && 
        typeof stream.embedUrl === 'string' && 
        stream.embedUrl.startsWith('http')
      );
      
      if (streamNo !== undefined) {
        const specificStream = validStreams.find(stream => stream.streamNo === streamNo);
        if (specificStream) {
          setCachedData(cacheKey, specificStream);
          return specificStream;
        }
      }
      
      setCachedData(cacheKey, validStreams);
      console.log(`✅ Streams loaded: ${validStreams.length}`);
      return validStreams;
    } else if (data && data.embedUrl) {
      setCachedData(cacheKey, data);
      console.log(`✅ Single stream loaded`);
      return data;
    }
    
    throw new Error('No valid streams found');
    
  } catch (error) {
    console.error(`❌ Stream fetch failed:`, error);
    
    // Return mock stream as fallback
    const mockStream = {
      ...MOCK_STREAM,
      id: `${source}-${id}`,
      source,
      streamNo: streamNo || 1
    };
    
    console.log('🔄 Using mock stream as fallback');
    return mockStream;
  }
};

// Utility functions
export const clearCache = () => {
  cache.clear();
  console.log('🧹 Cache cleared');
};

export const getCacheStats = () => ({
  entries: cache.size,
  keys: Array.from(cache.keys())
});

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await tryMultipleEndpoints('/sports', false);
    return true;
  } catch {
    return false;
  }
};
