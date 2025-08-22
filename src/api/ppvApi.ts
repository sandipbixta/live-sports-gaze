import { Sport, Match, Stream } from '../types/sports';

// PPV API Types (based on the documentation you provided)
interface PPVStreamObject {
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
  streams: PPVStreamObject[];
}

interface PPVApiResponse {
  success: boolean;
  timestamp: number;
  READ_ME: string;
  performance: number;
  streams: PPVCategory[];
}

const PPV_API_BASE = 'https://api.ppv-domain.com/api'; // TODO: Replace with actual PPV API base URL

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute as recommended in docs

// Helper functions for caching
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Map PPV categories to our sport IDs
const CATEGORY_TO_SPORT_MAP: Record<string, string> = {
  'Basketball': 'basketball',
  'Football': 'football', // Soccer
  'American Football': 'american-football',
  'Hockey': 'hockey',
  'Baseball': 'baseball',
  'Motor Sports': 'motor-sports',
  'Combat Sports': 'fight',
  'Tennis': 'tennis',
  'Rugby': 'rugby',
  'Golf': 'golf',
  'Cricket': 'cricket',
  'Darts': 'darts',
  'Billiards': 'billiards',
  'AFL': 'afl',
  'Other': 'other'
};

// Reverse mapping for getting category name from sport ID
const SPORT_TO_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_SPORT_MAP).map(([category, sport]) => [sport, category])
);

export const fetchPPVStreams = async (): Promise<PPVApiResponse> => {
  const cacheKey = 'ppv-streams';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${PPV_API_BASE}/streams`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`PPV API error: ${response.status} ${response.statusText}`);
    }

    const data: PPVApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error('PPV API returned success: false');
    }

    setCachedData(cacheKey, data);
    console.log(`✅ Fetched PPV streams: ${data.streams.length} categories`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching PPV streams:', error);
    throw error;
  }
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'ppv-sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const ppvData = await fetchPPVStreams();
    
    // Extract unique sports from PPV categories
    const sports: Sport[] = ppvData.streams
      .map(category => ({
        id: CATEGORY_TO_SPORT_MAP[category.category] || category.category.toLowerCase().replace(' ', '-'),
        name: category.category
      }))
      .filter((sport, index, array) => 
        array.findIndex(s => s.id === sport.id) === index
      );

    // Move tennis to the end (maintaining existing behavior)
    const tennisIndex = sports.findIndex(sport => sport.id === 'tennis');
    if (tennisIndex !== -1) {
      const tennisSport = sports.splice(tennisIndex, 1)[0];
      sports.push(tennisSport);
    }

    setCachedData(cacheKey, sports);
    console.log(`✅ Extracted ${sports.length} sports from PPV API`);
    return sports;
  } catch (error) {
    console.error('❌ Error fetching sports from PPV API:', error);
    throw error;
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `ppv-matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const ppvData = await fetchPPVStreams();
    const categoryName = SPORT_TO_CATEGORY_MAP[sportId];
    
    let relevantStreams: PPVStreamObject[] = [];
    
    if (sportId === 'all') {
      // Get all streams from all categories
      relevantStreams = ppvData.streams.flatMap(category => category.streams);
    } else if (categoryName) {
      // Find the specific category
      const category = ppvData.streams.find(cat => cat.category === categoryName);
      relevantStreams = category?.streams || [];
    }

    // Transform PPV streams to Match format
    const matches: Match[] = relevantStreams.map(stream => ({
      id: stream.uri_name || `ppv-${stream.id}`,
      title: stream.name,
      category: CATEGORY_TO_SPORT_MAP[stream.category_name] || sportId,
      date: stream.starts_at * 1000, // Convert to milliseconds
      poster: stream.poster,
      popular: stream.always_live === 1, // Mark always-live streams as popular
      sources: [{
        source: 'ppv',
        id: stream.uri_name || stream.id.toString()
      }],
      sportId: CATEGORY_TO_SPORT_MAP[stream.category_name] || sportId,
      // Store additional PPV data for stream access
      ppvData: {
        iframe: stream.iframe,
        tag: stream.tag,
        ends_at: stream.ends_at,
        always_live: stream.always_live,
        allowpaststreams: stream.allowpaststreams
      }
    }));

    setCachedData(cacheKey, matches);
    console.log(`✅ Fetched ${matches.length} matches for sport ${sportId} from PPV API`);
    return matches;
  } catch (error) {
    console.error(`❌ Error fetching matches for sport ${sportId} from PPV API:`, error);
    throw error;
  }
};

export const fetchLiveMatches = async (): Promise<Match[]> => {
  const cacheKey = 'ppv-live-matches';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const ppvData = await fetchPPVStreams();
    const now = Date.now() / 1000; // Current time in seconds
    
    // Get streams that are currently live
    const liveStreams = ppvData.streams.flatMap(category => 
      category.streams.filter(stream => 
        stream.always_live === 1 || 
        (stream.starts_at <= now && stream.ends_at >= now)
      )
    );

    const liveMatches: Match[] = liveStreams.map(stream => ({
      id: stream.uri_name || `ppv-${stream.id}`,
      title: stream.name,
      category: CATEGORY_TO_SPORT_MAP[stream.category_name] || 'other',
      date: stream.starts_at * 1000,
      poster: stream.poster,
      popular: stream.always_live === 1,
      sources: [{
        source: 'ppv',
        id: stream.uri_name || stream.id.toString()
      }],
      sportId: CATEGORY_TO_SPORT_MAP[stream.category_name] || 'other',
      ppvData: {
        iframe: stream.iframe,
        tag: stream.tag,
        ends_at: stream.ends_at,
        always_live: stream.always_live,
        allowpaststreams: stream.allowpaststreams
      }
    }));

    setCachedData(cacheKey, liveMatches);
    console.log(`✅ Fetched ${liveMatches.length} live matches from PPV API`);
    return liveMatches;
  } catch (error) {
    console.error('❌ Error fetching live matches from PPV API:', error);
    throw error;
  }
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  return fetchMatches('all');
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  const cacheKey = `ppv-match-${sportId}-${matchId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      throw new Error(`Match ${matchId} not found in PPV API`);
    }
    
    setCachedData(cacheKey, match);
    console.log(`✅ Found match ${matchId} for sport ${sportId} in PPV API`);
    return match;
  } catch (error) {
    console.error(`❌ Error fetching match ${matchId} from PPV API:`, error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string, streamNo?: number): Promise<Stream | Stream[]> => {
  const cacheKey = `ppv-stream-${source}-${id}-${streamNo || 'default'}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // For PPV API, we need to find the stream by ID and return the iframe
    const ppvData = await fetchPPVStreams();
    
    let targetStream: PPVStreamObject | null = null;
    
    // Search through all categories for the stream
    for (const category of ppvData.streams) {
      const stream = category.streams.find(s => 
        s.uri_name === id || s.id.toString() === id
      );
      if (stream) {
        targetStream = stream;
        break;
      }
    }
    
    if (!targetStream) {
      throw new Error(`Stream ${id} not found in PPV API`);
    }
    
    if (!targetStream.iframe) {
      throw new Error(`No iframe available for stream ${id}`);
    }
    
    // Create Stream object compatible with our existing format
    const stream: Stream = {
      id: targetStream.id.toString(),
      streamNo: streamNo || 1,
      language: 'en', // Default to English, could be enhanced
      hd: true, // Assume HD quality for PPV streams
      embedUrl: targetStream.iframe,
      source: 'ppv'
    };
    
    setCachedData(cacheKey, stream);
    console.log(`✅ Fetched PPV stream for ${id}`);
    return stream;
  } catch (error) {
    console.error(`❌ Error fetching PPV stream ${source}/${id}:`, error);
    throw error;
  }
};

// Helper function to check if a stream is currently live
export const isStreamLive = (match: Match): boolean => {
  if (!match.ppvData) return false;
  
  if (match.ppvData.always_live === 1) return true;
  
  const now = Date.now() / 1000;
  return match.date / 1000 <= now && match.ppvData.ends_at >= now;
};

// Helper function to check if past streams are allowed
export const canViewPastStream = (match: Match): boolean => {
  return match.ppvData?.allowpaststreams === 1;
};