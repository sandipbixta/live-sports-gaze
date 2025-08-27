
import { Sport, Match, Stream } from '../types/sports';

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

// Helper function to filter and reorder sports list
const filterAndReorderSports = (sports: Sport[]): Sport[] => {
  // Filter out unwanted sports: golf, hockey, billiards, darts
  const excludedSports = ['golf', 'hockey', 'billiards', 'darts'];
  const filteredSports = sports.filter(sport => 
    !excludedSports.includes(sport.id.toLowerCase())
  );
  
  // Move tennis to the end
  const tennisIndex = filteredSports.findIndex(sport => sport.id === 'tennis');
  if (tennisIndex === -1) return filteredSports; // Tennis not found, return as is
  
  const sportsWithoutTennis = filteredSports.filter(sport => sport.id !== 'tennis');
  const tennisSport = filteredSports[tennisIndex];
  
  // Add tennis at the end
  return [...sportsWithoutTennis, tennisSport];
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
'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid sports data format');
    }
    
    // Filter and reorder sports
    const reorderedData = filterAndReorderSports(data);
    setCachedData(cacheKey, reorderedData);
    console.log(`✅ Fetched ${reorderedData.length} sports from streamed.pk API`);
    return reorderedData;
  } catch (error) {
    console.error('❌ Error fetching sports from streamed.pk:', error);
    
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
            const reorderedRetryData = filterAndReorderSports(retryData);
            setCachedData(cacheKey, reorderedRetryData);
            console.log(`✅ Mobile retry successful: ${reorderedRetryData.length} sports`);
            return reorderedRetryData;
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
'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const matches = await response.json();
    
    if (!Array.isArray(matches)) {
      throw new Error('Invalid matches data format');
    }
    
    // Transform API matches to our format and filter by actual sport category
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
    }))
    // Filter matches to only include ones that actually belong to the requested sport
    .filter(match => {
      const matchCategory = (match.category || match.sportId || '').toLowerCase();
      const requestedSport = sportId.toLowerCase();
      
      // If requesting 'all', include everything
      if (requestedSport === 'all') {
        return true;
      }
      
      // Exact match first
      if (matchCategory === requestedSport) {
        return true;
      }
      
      // Create comprehensive sport mapping to handle API inconsistencies
      // Excluded: golf, hockey, billiards
      const sportMapping: { [key: string]: string[] } = {
        'football': ['football', 'soccer'],
        'basketball': ['basketball', 'basket'],
        'tennis': ['tennis'],
        'baseball': ['baseball'],
        'american-football': ['american-football', 'nfl', 'american football'],
        'motor-sports': ['motor-sports', 'motorsports', 'racing', 'motogp', 'f1', 'formula'],
        'fight': ['fight', 'boxing', 'mma', 'ufc', 'martial'],
        'rugby': ['rugby'],
        'cricket': ['cricket'],
        'afl': ['afl', 'australian football'],
        'other': ['other']
      };
      
      const allowedCategories = sportMapping[requestedSport] || [requestedSport];
      
      // Check if the match category contains any of the allowed terms
      const isMatch = allowedCategories.some(cat => {
        const categoryLower = cat.toLowerCase();
        return matchCategory.includes(categoryLower) || categoryLower.includes(matchCategory);
      });
      
      // Debug logging for problematic sports
      if (['football', 'basketball', 'baseball', 'billiards', 'cricket', 'fight', 'golf', 'hockey', 'afl', 'american-football'].includes(requestedSport)) {
        if (!isMatch) {
          console.log(`🚫 Filtered out: "${match.title}" (category: "${matchCategory}") for sport: "${requestedSport}"`);
        }
      }
      
      return isMatch;
    });
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} matches for sport ${sportId} (filtered from ${matches.length} total matches)`);
    return validMatches;
  } catch (error) {
    console.error(`❌ Error fetching matches for sport ${sportId} from streamed.pk:`, error);
    
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
            }))
            // Apply same filtering logic for mobile retry
            .filter(match => {
              const matchCategory = (match.category || match.sportId || '').toLowerCase();
              const requestedSport = sportId.toLowerCase();
              
              // If requesting 'all', include everything
              if (requestedSport === 'all') {
                return true;
              }
              
              // Exact match first
              if (matchCategory === requestedSport) {
                return true;
              }
              
              // Excluded: golf, hockey, billiards
              const sportMapping: { [key: string]: string[] } = {
                'football': ['football', 'soccer'],
                'basketball': ['basketball', 'basket'],
                'tennis': ['tennis'],
                'baseball': ['baseball'],
                'american-football': ['american-football', 'nfl', 'american football'],
                'motor-sports': ['motor-sports', 'motorsports', 'racing', 'motogp', 'f1', 'formula'],
                'fight': ['fight', 'boxing', 'mma', 'ufc', 'martial'],
                'rugby': ['rugby'],
                'cricket': ['cricket'],
                'afl': ['afl', 'australian football'],
                'other': ['other']
              };
              
              const allowedCategories = sportMapping[requestedSport] || [requestedSport];
              
              // Check if the match category contains any of the allowed terms
              return allowedCategories.some(cat => {
                const categoryLower = cat.toLowerCase();
                return matchCategory.includes(categoryLower) || categoryLower.includes(matchCategory);
              });
            });
            setCachedData(cacheKey, validMatches);
            console.log(`✅ Mobile retry successful: ${validMatches.length} matches for ${sportId} (filtered from ${retryData.length} total)`);
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
'Accept': 'application/json'
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
    }))
    // Filter out excluded sports: golf, hockey, billiards, darts
    .filter(match => {
      const sportCategory = (match.sportId || match.category || '').toLowerCase();
      const excludedSports = ['golf', 'hockey', 'billiards', 'darts'];
      return !excludedSports.includes(sportCategory);
    });
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} live matches from streamed.pk API`);
    return validMatches;
  } catch (error) {
    console.error('❌ Error fetching live matches from streamed.pk:', error);
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
'Accept': 'application/json'
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
    }))
    // Filter out excluded sports: golf, hockey, billiards, darts
    .filter(match => {
      const sportCategory = (match.sportId || match.category || '').toLowerCase();
      const excludedSports = ['golf', 'hockey', 'billiards', 'darts'];
      return !excludedSports.includes(sportCategory);
    });
    
    setCachedData(cacheKey, validMatches);
    console.log(`✅ Fetched ${validMatches.length} matches from streamed.pk API`);
    return validMatches;
  } catch (error) {
    console.error('❌ Error fetching all matches from streamed.pk:', error);
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
    console.log(`📡 Fetching stream from streamed.pk: source=${source}, id=${id}, streamNo=${streamNo}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const suUrl = `https://streamed.su/api/stream/${source}/${id}`;
    const pkUrl = `${API_BASE}/stream/${source}/${id}`;

    let response: Response | null = null;

    if (isMobile) {
      try {
        console.log('📡 Trying streamed.su for stream (mobile first)...');
        response = await fetch(suUrl, {
          signal: controller.signal,
          headers: {
'Accept': 'application/json'
          },
          cache: 'no-store',
        });
      } catch (e) {
        console.warn('⚠️ streamed.su stream fetch failed, will fallback to streamed.pk', e);
      }
    }

    if (!response || !response.ok) {
      console.log('↩️ Falling back to streamed.pk for stream...');
      response = await fetch(pkUrl, {
        signal: controller.signal,
        headers: {
'Accept': 'application/json'
        },
        cache: 'no-store',
      });
    }
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📺 Stream API response received:', { source, id, streamCount: Array.isArray(data) ? data.length : 1 });

    // Normalize helper for embed URLs
    const normalize = (url: string) => {
      if (!url) return url as any;
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('http://')) return url.replace(/^http:\/\//i, 'https://');
      return url;
    };
    
    // Handle response format with normalization
    if (Array.isArray(data) && data.length > 0) {
      const sanitized = data.map((stream: any) =>
        stream && stream.embedUrl ? { ...stream, embedUrl: normalize(stream.embedUrl) } : stream
      );
      const validStreams = sanitized.filter(stream => stream && isValidStreamUrl(stream.embedUrl));
      
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
      const single = { ...data, embedUrl: normalize(data.embedUrl) };
      if (isValidStreamUrl(single.embedUrl)) {
        setCachedData(cacheKey, single);
        console.log(`✅ Fetched single stream for ${source}/${id}`);
        return single;
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
  if (!url || typeof url !== 'string') return false;
  const startsOk = url.startsWith('http') || url.startsWith('//');
  if (!startsOk) return false;
  const invalidDomains = ['youtube.com', 'youtu.be', 'demo', 'example.com', 'localhost'];
  return !invalidDomains.some(domain => url.toLowerCase().includes(domain));
}
