
import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.su/api';

// Enhanced cache with performance tracking
const cache = new Map<string, { data: any; timestamp: number; loadTime: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // Reduced to 3 minutes for fresher data

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
  if (times.length > 10) times.shift(); // Keep last 10 measurements
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`📊 ${key} - Current: ${loadTime}ms, Average: ${avgTime.toFixed(1)}ms`);
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();
  try {
    console.log('🏃 Fetching sports data...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE}/sports`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=300'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch sports');
    const data = await response.json();
    const loadTime = performance.now() - startTime;
    
    setCachedData(cacheKey, data, loadTime);
    console.log(`✅ Sports data loaded in ${loadTime}ms`);
    return data;
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`❌ Sports fetch failed after ${loadTime}ms:`, error);
    return [];
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const startTime = performance.now();
  try {
    console.log(`🏃 Fetching matches for sport: ${sportId}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE}/matches/${sportId}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=180'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch matches');
    const matches = await response.json();
    const loadTime = performance.now() - startTime;
    
    setCachedData(cacheKey, matches, loadTime);
    console.log(`✅ Matches for ${sportId} loaded in ${loadTime}ms (${matches.length} matches)`);
    return matches;
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`❌ Matches fetch failed for ${sportId} after ${loadTime}ms:`, error);
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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
    
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache', // Force fresh stream data
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    
    const data = await response.json();
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
