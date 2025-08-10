
import { Sport, Match, Stream } from '../types/sports';
import { detectLanguageFromUrl } from '../utils/languageDetection';

const API_BASE = 'https://streamed.pk/api';

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
  if (cached) {
    console.log('✅ Using cached sports data:', cached.length);
    return cached;
  }

  console.log('🔄 Fetching sports from streamed.pk API...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    console.log('🌐 Making request to:', `${API_BASE}/sports`);
    
    const response = await fetch(`${API_BASE}/sports`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📊 Raw API response:', data);
    
    if (!Array.isArray(data)) {
      console.error('❌ Invalid data format:', typeof data, data);
      throw new Error('Invalid sports data format - expected array');
    }
    
    setCachedData(cacheKey, data);
    console.log(`✅ Fetched ${data.length} sports from streamed.pk API`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching sports from streamed.pk:', error);
    return [];
  }
};

// New API endpoints for different match types
export const fetchAllMatches = async (): Promise<Match[]> => {
  return fetchMatchesFromEndpoint('all');
};

export const fetchLiveMatches = async (): Promise<Match[]> => {
  return fetchMatchesFromEndpoint('live');
};

export const fetchTodayMatches = async (): Promise<Match[]> => {
  return fetchMatchesFromEndpoint('all-today');
};

export const fetchPopularMatches = async (): Promise<Match[]> => {
  return fetchMatchesFromEndpoint('all/popular');
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  return fetchMatchesFromEndpoint(`${sportId}`);
};

export const fetchPopularMatchesBySport = async (sportId: string): Promise<Match[]> => {
  return fetchMatchesFromEndpoint(`${sportId}/popular`);
};

// Helper function to fetch matches from different endpoints
const fetchMatchesFromEndpoint = async (endpoint: string): Promise<Match[]> => {
  const cacheKey = `matches-${endpoint}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`✅ Using cached matches for ${endpoint}:`, cached.length);
    return cached;
  }

  console.log(`🔄 Fetching matches from endpoint: ${endpoint}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    console.log('🌐 Making request to:', `${API_BASE}/matches/${endpoint}`);
    
    const response = await fetch(`${API_BASE}/matches/${endpoint}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 Matches response status:', response.status, response.statusText);
    console.log('📡 Matches response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Matches API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const matches = await response.json();
    console.log('📊 Raw matches API response:', matches);
    
    if (!Array.isArray(matches)) {
      console.error('❌ Invalid matches data format:', typeof matches, matches);
      throw new Error('Invalid matches data format - expected array');
    }
    
    // Transform API data to our format and add logo URLs
    const validMatches = matches.filter(match => 
      match && 
      match.id && 
      match.title && 
      match.date &&
      Array.isArray(match.sources)
    ).map(match => ({
      id: match.id,
      title: match.title,
      date: new Date(match.date).toISOString(),
      sportId: match.category || endpoint.split('/')[0],
      teams: match.teams ? {
        home: match.teams.home ? {
          name: match.teams.home.name,
          badge: match.teams.home.badge,
          logo: match.teams.home.badge ? `${API_BASE}/images/badge/${match.teams.home.badge}.webp` : undefined
        } : undefined,
        away: match.teams.away ? {
          name: match.teams.away.name,
          badge: match.teams.away.badge,
          logo: match.teams.away.badge ? `${API_BASE}/images/badge/${match.teams.away.badge}.webp` : undefined
        } : undefined
      } : undefined,
      sources: match.sources || [],
      poster: match.poster ? `${API_BASE}/images/proxy/${match.poster}.webp` : undefined
    }));
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} matches from endpoint ${endpoint} from streamed.pk API`);
    return validMatches;
  } catch (error) {
    console.error(`❌ Error fetching matches from endpoint ${endpoint} from streamed.pk:`, error);
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
    console.log(`📡 Fetching stream from streamed.pk: source=${source}, id=${id}, streamNo=${streamNo}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
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
      const validStreams = data
        .filter(stream => stream && isValidStreamUrl(stream.embedUrl))
        .map(stream => ({
          ...stream,
          language: detectLanguageFromUrl(stream.embedUrl),
          embedUrl: ensureValidEmbedUrl(stream.embedUrl)
        }));
      
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
        const stream = { 
          ...data, 
          language: detectLanguageFromUrl(data.embedUrl),
          embedUrl: ensureValidEmbedUrl(data.embedUrl) 
        };
        setCachedData(cacheKey, stream);
        console.log(`✅ Fetched single stream for ${source}/${id}`);
        return stream;
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

// Helper function to ensure embed URL is valid
function ensureValidEmbedUrl(url: string): string {
  if (url && typeof url === 'string' && url.startsWith('http') && isValidStreamUrl(url)) {
    return url;
  }
  throw new Error(`Invalid stream URL: ${url}`);
}
