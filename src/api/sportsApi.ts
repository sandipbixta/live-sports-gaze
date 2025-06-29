
import { Sport, Match, Stream } from '../types/sports';

// Multiple API endpoints for redundancy
const API_ENDPOINTS = [
  'https://streamed.su/api',
  'https://api.streamed.su',
  'https://backup.streamed.su/api'
];

let currentEndpointIndex = 0;

// Enhanced cache with faster expiration
const cache = new Map<string, { data: any; timestamp: number; loadTime: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // Reduced to 2 minutes for faster updates

// Performance tracking
const performanceLog = new Map<string, number[]>();

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit for ${key} (loaded in ${cached.loadTime}ms)`);
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any, loadTime: number) => {
  cache.set(key, { data, timestamp: Date.now(), loadTime });
  
  // Track performance
  if (!performanceLog.has(key)) {
    performanceLog.set(key, []);
  }
  const times = performanceLog.get(key)!;
  times.push(loadTime);
  if (times.length > 5) times.shift(); // Keep last 5 measurements
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`📊 ${key} - Current: ${loadTime}ms, Average: ${avgTime.toFixed(1)}ms`);
};

// Retry fetch with different endpoints
const fetchWithRetry = async (endpoint: string, timeout: number = 3000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const tryMultipleEndpoints = async (path: string): Promise<any> => {
  let lastError: Error | null = null;
  
  // Try current endpoint first
  for (let attempt = 0; attempt < API_ENDPOINTS.length; attempt++) {
    const endpointIndex = (currentEndpointIndex + attempt) % API_ENDPOINTS.length;
    const endpoint = `${API_ENDPOINTS[endpointIndex]}${path}`;
    
    try {
      console.log(`🔄 Trying endpoint ${endpointIndex + 1}/${API_ENDPOINTS.length}: ${endpoint}`);
      const response = await fetchWithRetry(endpoint, 2000); // 2 second timeout
      const data = await response.json();
      
      // Update current endpoint on success
      currentEndpointIndex = endpointIndex;
      console.log(`✅ Success with endpoint ${endpointIndex + 1}`);
      return data;
    } catch (error) {
      console.warn(`❌ Endpoint ${endpointIndex + 1} failed:`, error);
      lastError = error as Error;
    }
  }
  
  throw lastError || new Error('All endpoints failed');
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();
  try {
    console.log('🏃 Fetching sports data...');
    const data = await tryMultipleEndpoints('/sports');
    const loadTime = performance.now() - startTime;
    
    setCachedData(cacheKey, data, loadTime);
    console.log(`✅ Sports data loaded in ${loadTime}ms`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`❌ Sports fetch failed after ${loadTime}ms:`, error);
    
    // Return mock data as fallback
    const mockSports = [
      { id: '1', name: 'Football', slug: 'football' },
      { id: '2', name: 'Basketball', slug: 'basketball' },
      { id: '3', name: 'Tennis', slug: 'tennis' },
      { id: '4', name: 'Hockey', slug: 'hockey' }
    ];
    
    console.log('🔄 Using fallback sports data');
    return mockSports;
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();
  try {
    console.log(`🏃 Fetching matches for sport: ${sportId}`);
    const matches = await tryMultipleEndpoints(`/matches/${sportId}`);
    const loadTime = performance.now() - startTime;
    
    const validMatches = Array.isArray(matches) ? matches : [];
    setCachedData(cacheKey, validMatches, loadTime);
    console.log(`✅ Matches for ${sportId} loaded in ${loadTime}ms (${validMatches.length} matches)`);
    return validMatches;
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`❌ Matches fetch failed for ${sportId} after ${loadTime}ms:`, error);
    
    // Return empty array instead of throwing
    return [];
  }
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  const cacheKey = `match-${sportId}-${matchId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();
  try {
    console.log(`🏃 Fetching specific match: ${sportId}/${matchId}`);
    
    // First try to get from cached matches
    const cachedMatches = getCachedData(`matches-${sportId}`);
    if (cachedMatches) {
      const match = cachedMatches.find((m: Match) => m.id === matchId);
      if (match) {
        const loadTime = performance.now() - startTime;
        setCachedData(cacheKey, match, loadTime);
        console.log(`✅ Match found in cache in ${loadTime}ms`);
        return match;
      }
    }

    // Fallback to fetching all matches
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    
    const loadTime = performance.now() - startTime;
    setCachedData(cacheKey, match, loadTime);
    console.log(`✅ Match loaded via fallback in ${loadTime}ms`);
    return match;
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`❌ Match fetch failed after ${loadTime}ms:`, error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string, streamNo?: number): Promise<Stream | Stream[]> => {
  const cacheKey = `stream-${source}-${id}-${streamNo || 'all'}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();
  try {
    console.log(`🎬 Fetching stream: ${source}/${id}${streamNo ? `/${streamNo}` : ''}`);
    
    const data = await tryMultipleEndpoints(`/stream/${source}/${id}`);
    const loadTime = performance.now() - startTime;
    console.log(`📡 Stream API responded in ${loadTime}ms:`, data);
    
    // Handle response format
    if (Array.isArray(data) && data.length > 0) {
      const validStreams = data.filter(stream => isValidStreamUrl(stream.embedUrl));
      console.log(`🔍 Found ${validStreams.length} valid streams out of ${data.length}`);
      
      if (streamNo !== undefined) {
        const specificStream = validStreams.find(stream => stream.streamNo === streamNo);
        if (specificStream) {
          const result = { ...specificStream, embedUrl: ensureValidEmbedUrl(specificStream.embedUrl) };
          setCachedData(cacheKey, result, loadTime);
          console.log(`✅ Specific stream ${streamNo} loaded in ${loadTime}ms`);
          return result;
        }
      }
      
      const result = validStreams.map(stream => ({
        ...stream,
        embedUrl: ensureValidEmbedUrl(stream.embedUrl)
      }));
      setCachedData(cacheKey, result, loadTime);
      console.log(`✅ ${validStreams.length} streams loaded in ${loadTime}ms`);
      return result;
    } else if (data && typeof data === 'object' && data.embedUrl) {
      if (isValidStreamUrl(data.embedUrl)) {
        const result = { ...data, embedUrl: ensureValidEmbedUrl(data.embedUrl) };
        setCachedData(cacheKey, result, loadTime);
        console.log(`✅ Single stream loaded in ${loadTime}ms`);
        return result;
      }
    }
    
    throw new Error('No valid streams found');
    
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`❌ Stream fetch failed after ${loadTime}ms:`, error);
    throw error;
  }
};

// Helper function to check if URL is valid
function isValidStreamUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  
  const invalidDomains = ['youtube.com', 'youtu.be', 'demo', 'example.com', 'localhost'];
  return !invalidDomains.some(domain => url.includes(domain));
}

// Helper function to ensure embed URL is valid
function ensureValidEmbedUrl(url: string): string {
  if (url && typeof url === 'string' && url.startsWith('http') && isValidStreamUrl(url)) {
    return url;
  }
  throw new Error('Invalid stream URL');
}

// Clear cache function for manual refresh
export const clearCache = () => {
  cache.clear();
  performanceLog.clear();
  console.log('🧹 Cache cleared');
};

// Get cache statistics
export const getCacheStats = () => {
  return {
    entries: cache.size,
    performance: Object.fromEntries(performanceLog.entries())
  };
};
