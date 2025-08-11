
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

  // Detect mobile and adjust timeout
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const timeout = isMobile ? 15000 : 10000; // Longer timeout for mobile

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE}/sports`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid sports data format');
    }
    
    setCachedData(cacheKey, data);
    console.log(`✅ Fetched ${data.length} sports from streamed.su API`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching sports from streamed.su:', error);
    
    // On mobile, try one more time with a simpler request
    if (isMobile && !error.message.includes('retry')) {
      console.log('🔄 Retrying with mobile-optimized request...');
      try {
        const retryResponse = await fetch(`${API_BASE}/sports`, {
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          if (Array.isArray(retryData)) {
            setCachedData(cacheKey, retryData);
            console.log(`✅ Mobile retry successful: ${retryData.length} sports`);
            return retryData;
          }
        }
      } catch (retryError) {
        console.error('❌ Mobile retry failed:', retryError);
      }
    }
    
    throw error;
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  // Detect mobile and adjust timeout
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const timeout = isMobile ? 20000 : 15000; // Even longer timeout for mobile matches

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE}/matches/${sportId}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const matches = await response.json();
    
    if (!Array.isArray(matches)) {
      throw new Error('Invalid matches data format');
    }
    
    // Transform API matches to our format
    const validMatches = matches.filter(match => 
      match && 
      match.id && 
      match.title && 
      match.date &&
      Array.isArray(match.sources)
    ).map(match => ({
      ...match,
      sportId: match.category || sportId, // Map category to sportId for compatibility
      category: match.category || sportId
    }));
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} matches for sport ${sportId} from streamed.su API`);
    return validMatches;
  } catch (error) {
    console.error(`❌ Error fetching matches for sport ${sportId} from streamed.su:`, error);
    
    // On mobile, try one more time with a simpler request
    if (isMobile && !error.message.includes('retry')) {
      console.log(`🔄 Mobile retry for matches ${sportId}...`);
      try {
        const retryResponse = await fetch(`${API_BASE}/matches/${sportId}`, {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          if (Array.isArray(retryData)) {
            const validMatches = retryData.filter(match => 
              match && 
              match.id && 
              match.title && 
              match.date &&
              Array.isArray(match.sources)
            ).map(match => ({
              ...match,
              sportId: match.category || sportId,
              category: match.category || sportId
            }));
            setCachedData(cacheKey, validMatches);
            console.log(`✅ Mobile retry successful: ${validMatches.length} matches for ${sportId}`);
            return validMatches;
          }
        }
      } catch (retryError) {
        console.error(`❌ Mobile retry failed for ${sportId}:`, retryError);
      }
    }
    
    throw error;
  }
};

// New functions to support different match endpoints
export const fetchLiveMatches = async (): Promise<Match[]> => {
  const cacheKey = 'matches-live';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE}/matches/live`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const matches = await response.json();
    
    if (!Array.isArray(matches)) {
      throw new Error('Invalid matches data format');
    }
    
    const validMatches = matches.filter(match => 
      match && match.id && match.title && match.date && Array.isArray(match.sources)
    ).map(match => ({
      ...match,
      sportId: match.category
    }));
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} live matches from streamed.su API`);
    return validMatches;
  } catch (error) {
    console.error('❌ Error fetching live matches from streamed.su:', error);
    throw error;
  }
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  const cacheKey = 'matches-all';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE}/matches/all`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const matches = await response.json();
    
    if (!Array.isArray(matches)) {
      throw new Error('Invalid matches data format');
    }
    
    const validMatches = matches.filter(match => 
      match && match.id && match.title && match.date && Array.isArray(match.sources)
    ).map(match => ({
      ...match,
      sportId: match.category
    }));
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} matches from streamed.su API`);
    return validMatches;
  } catch (error) {
    console.error('❌ Error fetching all matches from streamed.su:', error);
    throw error;
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
        console.log(`✅ Found match ${matchId} in cache`);
        return match;
      }
    }

    // If not in cache, fetch all matches for this sport and find the specific match
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }
    
    setCachedData(cacheKey, match);
    console.log(`✅ Found match ${matchId} for sport ${sportId}`);
    return match;
  } catch (error) {
    console.error(`❌ Error fetching match ${matchId}:`, error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string, streamNo?: number): Promise<Stream | Stream[]> => {
  const cacheKey = `stream-${source}-${id}-${streamNo || 'all'}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`📡 Fetching stream from streamed.su: source=${source}, id=${id}, streamNo=${streamNo}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📺 Stream API response received:', { source, id, streamCount: Array.isArray(data) ? data.length : 1 });
    
    // Handle response format
    if (Array.isArray(data) && data.length > 0) {
      const validStreams = data.filter(stream => stream && isValidStreamUrl(stream.embedUrl));
      
      if (validStreams.length === 0) {
        throw new Error('No valid streams found in response');
      }
      
      if (streamNo !== undefined) {
        const specificStream = validStreams.find(stream => stream.streamNo === streamNo);
        if (specificStream) {
          setCachedData(cacheKey, specificStream);
          console.log(`✅ Found specific stream ${streamNo} for ${source}/${id}`);
          return specificStream;
        }
        // If specific stream not found, return the first valid stream
        const firstStream = validStreams[0];
        setCachedData(cacheKey, firstStream);
        console.log(`⚠️ Stream ${streamNo} not found, returning first available stream`);
        return firstStream;
      }
      
      setCachedData(cacheKey, validStreams);
      console.log(`✅ Fetched ${validStreams.length} valid streams for ${source}/${id}`);
      return validStreams;
    } else if (data && typeof data === 'object' && data.embedUrl) {
      if (isValidStreamUrl(data.embedUrl)) {
        setCachedData(cacheKey, data);
        console.log(`✅ Fetched single stream for ${source}/${id}`);
        return data;
      }
    }
    
    throw new Error('No valid streams found in API response');
    
  } catch (error) {
    console.error(`❌ Error fetching stream ${source}/${id}:`, error);
    throw error;
  }
};

// Helper function to check if URL is valid
function isValidStreamUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
  
  const invalidDomains = ['youtube.com', 'youtu.be', 'demo', 'example.com', 'localhost'];
  return !invalidDomains.some(domain => url.toLowerCase().includes(domain));
}
