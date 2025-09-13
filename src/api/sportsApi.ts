
import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.pk/api';
const PPV_API_BASE = 'https://ppv.to/api';

// Cache for API responses to avoid repeated calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PPV_CACHE_DURATION = 1 * 60 * 1000; // 1 minute for ppv.to as recommended

// PPV.to API Response Types
interface PPVStream {
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

interface PPVCategory {
  category: string;
  id: number;
  always_live: number;
  streams: PPVStream[];
}

interface PPVResponse {
  success: boolean;
  timestamp: number;
  READ_ME: string;
  performance: number;
  streams: PPVCategory[];
}

// Helper function to get cached data
const getCachedData = (key: string, customDuration?: number) => {
  const cached = cache.get(key);
  const duration = customDuration || CACHE_DURATION;
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// PPV.to API functions
const fetchPPVStreams = async (): Promise<PPVResponse> => {
  const cacheKey = 'ppv-streams';
  const cached = getCachedData(cacheKey, PPV_CACHE_DURATION);
  if (cached) return cached;

  try {
    console.log('📡 Fetching streams from ppv.to API...');
    const response = await fetch(`${PPV_API_BASE}/streams`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`PPV.to API HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('PPV.to API returned unsuccessful response');
    }

    setCachedData(cacheKey, data);
    console.log(`✅ Fetched PPV.to streams: ${data.streams?.length || 0} categories`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching from ppv.to API:', error);
    throw error;
  }
};

const transformPPVMatch = (ppvStream: PPVStream): Match => {
  // Convert PPV stream to our Match format
  return {
    id: `ppv-${ppvStream.id}`,
    title: ppvStream.name,
    category: 'football',
    date: ppvStream.starts_at * 1000, // Convert Unix timestamp to milliseconds
    poster: ppvStream.poster,
    popular: false,
    teams: undefined, // PPV.to doesn't provide team structure
    sources: [{
      source: 'ppv',
      id: ppvStream.uri_name
    }],
    sportId: 'football',
    // Store PPV-specific data for later use
    ppvData: {
      iframe: ppvStream.iframe,
      endsAt: ppvStream.ends_at * 1000,
      alwaysLive: ppvStream.always_live === 1,
      tag: ppvStream.tag,
      allowPastStreams: ppvStream.allowpaststreams === 1
    }
  } as Match & { ppvData: any };
};

const transformPPVStream = (ppvMatch: Match & { ppvData: any }): Stream => {
  // Convert PPV match to our Stream format
  return {
    id: ppvMatch.id,
    streamNo: 1,
    language: 'English',
    hd: true,
    embedUrl: ppvMatch.ppvData?.iframe || '',
    source: 'ppv',
    timestamp: Date.now()
  };
};

const fetchFootballFromPPV = async (): Promise<Match[]> => {
  try {
    const ppvData = await fetchPPVStreams();
    const footballCategory = ppvData.streams.find(cat => 
      cat.category.toLowerCase() === 'football'
    );

    if (!footballCategory) {
      console.warn('⚠️ No football category found in PPV.to streams');
      return [];
    }

    const footballMatches = footballCategory.streams
      .filter(stream => stream.iframe) // Only include streams with iframe available
      .map(transformPPVMatch);

    console.log(`✅ Transformed ${footballMatches.length} football matches from PPV.to`);
    return footballMatches;
  } catch (error) {
    console.error('❌ Error fetching football from PPV.to:', error);
    return []; // Return empty array instead of throwing to maintain other sports functionality
  }
};

// Helper function to filter and reorder sports list
const filterAndReorderSports = (sports: Sport[]): Sport[] => {
  // Filter out unwanted sports: golf, hockey, billiards, darts, and football (will be added from PPV.to)
  const excludedSports = ['golf', 'hockey', 'billiards', 'darts', 'football'];
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
    
    // Filter and reorder sports (excludes football)
    const reorderedData = filterAndReorderSports(data);
    
    // Add football from PPV.to
    const footballSport: Sport = { id: 'football', name: 'Football' };
    const finalSports = [footballSport, ...reorderedData];
    
    setCachedData(cacheKey, finalSports);
    console.log(`✅ Fetched ${finalSports.length} sports (football from PPV.to, others from streamed.pk)`);
    return finalSports;
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
  // If requesting football, fetch from PPV.to
  if (sportId.toLowerCase() === 'football') {
    const cacheKey = `matches-football-ppv`;
    const cached = getCachedData(cacheKey, PPV_CACHE_DURATION);
    if (cached) return cached;
    
    const footballMatches = await fetchFootballFromPPV();
    setCachedData(cacheKey, footballMatches);
    return footballMatches;
  }

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
    // Fetch live matches from both APIs
    const [streamedMatches, footballMatches] = await Promise.allSettled([
      // Streamed.pk live matches (excluding football)
      fetch(`${API_BASE}/matches/live`, {
        headers: {
'Accept': 'application/json'
        }
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.json();
      }),
      // PPV.to football matches
      fetchFootballFromPPV()
    ]);

    let allMatches: Match[] = [];

    // Process streamed.pk matches
    if (streamedMatches.status === 'fulfilled') {
      const matches = streamedMatches.value;
      if (Array.isArray(matches)) {
        const validMatches = matches.filter(match => 
          match && match.id && match.title && match.date && Array.isArray(match.sources)
        ).map(match => ({
          ...match,
          sportId: match.category
        }))
        // Filter out excluded sports: golf, hockey, billiards, darts, football
        .filter(match => {
          const sportCategory = (match.sportId || match.category || '').toLowerCase();
          const excludedSports = ['golf', 'hockey', 'billiards', 'darts', 'football'];
          return !excludedSports.includes(sportCategory);
        });
        allMatches = [...allMatches, ...validMatches];
      }
    }

    // Process PPV.to football matches (filter for live ones)
    if (footballMatches.status === 'fulfilled') {
      const footballLiveMatches = footballMatches.value.filter(match => {
        const now = Date.now();
        const matchTime = match.date;
        const matchEnd = (match as any).ppvData?.endsAt || matchTime + (3 * 60 * 60 * 1000); // Default 3 hours if no end time
        return matchTime <= now && now <= matchEnd;
      });
      allMatches = [...allMatches, ...footballLiveMatches];
    }
    
    setCachedData(cacheKey, allMatches);
    console.log(`✅ Fetched ${allMatches.length} live matches (combined from both APIs)`);
    return allMatches;
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
    // Fetch all matches from both APIs
    const [streamedMatches, footballMatches] = await Promise.allSettled([
      // Streamed.pk all matches (excluding football)
      fetch(`${API_BASE}/matches/all`, {
        headers: {
'Accept': 'application/json'
        }
      }).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.json();
      }),
      // PPV.to football matches
      fetchFootballFromPPV()
    ]);

    let allMatches: Match[] = [];

    // Process streamed.pk matches
    if (streamedMatches.status === 'fulfilled') {
      const matches = streamedMatches.value;
      if (Array.isArray(matches)) {
        const validMatches = matches.filter(match => 
          match && match.id && match.title && match.date && Array.isArray(match.sources)
        ).map(match => ({
          ...match,
          sportId: match.category
        }))
        // Filter out excluded sports: golf, hockey, billiards, darts, football
        .filter(match => {
          const sportCategory = (match.sportId || match.category || '').toLowerCase();
          const excludedSports = ['golf', 'hockey', 'billiards', 'darts', 'football'];
          return !excludedSports.includes(sportCategory);
        });
        allMatches = [...allMatches, ...validMatches];
      }
    }

    // Process PPV.to football matches
    if (footballMatches.status === 'fulfilled') {
      allMatches = [...allMatches, ...footballMatches.value];
    }
    
    setCachedData(cacheKey, allMatches);
    console.log(`✅ Fetched ${allMatches.length} matches (combined from both APIs)`);
    return allMatches;
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
    // Determine cache key based on sport
    const matchesCacheKey = sportId.toLowerCase() === 'football' ? 'matches-football-ppv' : `matches-${sportId}`;
    
    // First try to get from cached matches
    const cachedMatches = getCachedData(matchesCacheKey, sportId.toLowerCase() === 'football' ? PPV_CACHE_DURATION : CACHE_DURATION);
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
  // Handle PPV.to streams differently
  if (source === 'ppv') {
    const cacheKey = `stream-ppv-${id}`;
    const cached = getCachedData(cacheKey, PPV_CACHE_DURATION);
    if (cached) return cached;

    try {
      // Find the PPV match by uri_name
      const footballMatches = await fetchFootballFromPPV();
      const ppvMatch = footballMatches.find(match => 
        match.sources.some(s => s.id === id)
      ) as Match & { ppvData: any };

      if (!ppvMatch || !ppvMatch.ppvData?.iframe) {
        throw new Error(`PPV stream not found or iframe not available for ${id}`);
      }

      const stream = transformPPVStream(ppvMatch);
      setCachedData(cacheKey, stream);
      console.log(`✅ Found PPV.to stream for ${id}`);
      return stream;
    } catch (error) {
      console.error(`❌ Error fetching PPV.to stream for ${id}:`, error);
      throw error;
    }
  }

  // Allow all available sources as per API documentation for streamed.pk
  const allowedSources = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'intel'];
  if (!allowedSources.includes(source.toLowerCase())) {
    throw new Error(`Source "${source}" is not allowed. Supported sources: ${allowedSources.join(', ')}`);
  }

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

// Enhanced function to fetch ALL streams from ALL available sources for a match
export const fetchAllStreams = async (match: Match): Promise<Record<string, Stream[]>> => {
  if (!match.sources || match.sources.length === 0) {
    throw new Error('No sources available for this match');
  }

  const allStreams: Record<string, Stream[]> = {};
  const fetchPromises = match.sources.map(async (source) => {
    const sourceKey = `${source.source}/${source.id}`;
    
    try {
      console.log(`🔄 Fetching streams from ${source.source} for match: ${match.title}`);
      const streamData = await fetchStream(source.source, source.id);
      
      if (Array.isArray(streamData)) {
        allStreams[sourceKey] = streamData;
      } else if (streamData) {
        allStreams[sourceKey] = [streamData];
      }
      
      console.log(`✅ Successfully fetched ${allStreams[sourceKey]?.length || 0} streams from ${source.source}`);
    } catch (error) {
      console.warn(`⚠️ Failed to fetch streams from ${source.source}:`, error);
      // Continue with other sources even if one fails
    }
  });

  // Wait for all sources to complete (with failures handled gracefully)
  await Promise.allSettled(fetchPromises);

  console.log(`🎯 Total streams fetched from ${Object.keys(allStreams).length} sources for match: ${match.title}`);
  return allStreams;
};

// Helper function to check if URL is valid
function isValidStreamUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const startsOk = url.startsWith('http') || url.startsWith('//');
  if (!startsOk) return false;
  const invalidDomains = ['youtube.com', 'youtu.be', 'demo', 'example.com', 'localhost'];
  return !invalidDomains.some(domain => url.toLowerCase().includes(domain));
}
