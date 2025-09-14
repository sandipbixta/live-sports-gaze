
import { Sport, Match, Stream } from '../types/sports';

const SSSS_API_BASE = 'https://api.ssssdata.com/v1.1';
const SSSS_ACCESS_TOKEN = 'SMB9MtuEJTs6FdH_owwf0QXWtqoyJ0';

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

// Transform SSSS API streams to our format
const transformSSSSStreamToMatch = (stream: any): Match => {
  const category = stream.category || stream.sport || 'other';
  return {
    id: stream.id?.toString() || '',
    title: stream.name || stream.title || 'Unknown Stream',
    category: category,
    date: Date.now(), // SSSS streams appear to be live
    poster: stream.poster || stream.image || '',
    popular: false,
    sources: [{
      source: 'ssss',
      id: stream.id?.toString() || '',
      embedUrl: `https://damitv.pro/embed/${stream.id}`
    }]
  };
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports-ssss';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log('📡 Fetching from SSSS API...');
    const response = await fetch(`${SSSS_API_BASE}/stream/list?language=en&access-token=${SSSS_ACCESS_TOKEN}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('📡 SSSS API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📡 SSSS API Response:', data);
    console.log('📡 SSSS API Response type:', typeof data);
    console.log('📡 SSSS API Response is array:', Array.isArray(data));
    
    // Handle different response formats
    let streams = [];
    if (Array.isArray(data)) {
      streams = data;
    } else if (data && typeof data === 'object') {
      // If it's an object, check for common array properties
      if (data.streams && Array.isArray(data.streams)) {
        streams = data.streams;
      } else if (data.data && Array.isArray(data.data)) {
        streams = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        streams = data.results;
      } else {
        // If it's an object with properties, try to extract values
        const values = Object.values(data);
        console.log('📡 Object values:', values);
        if (values.length > 0 && Array.isArray(values[0])) {
          streams = values[0];
        } else {
          console.log('📡 Unexpected SSSS API structure:', Object.keys(data));
          // Return fallback sports instead of throwing
          return getFallbackSports();
        }
      }
    } else {
      console.log('📡 Invalid SSSS API data format - returning fallback');
      return getFallbackSports();
    }
    
    if (!Array.isArray(streams) || streams.length === 0) {
      console.warn('⚠️ No streams found in SSSS API response - returning fallback');
      return getFallbackSports();
    }
    
    // Extract unique categories/sports from streams
    const sportsMap = new Map<string, Sport>();
    
    streams.forEach((stream: any) => {
      if (stream && (stream.category || stream.sport)) {
        const category = stream.category || stream.sport;
        const sportId = category.toLowerCase().replace(/\s+/g, '-');
        const sportName = category;
        
        if (!sportsMap.has(sportId)) {
          sportsMap.set(sportId, {
            id: sportId,
            name: sportName
          });
        }
      }
    });
    
    const sports = Array.from(sportsMap.values());
    if (sports.length === 0) {
      console.warn('⚠️ No sports extracted from streams - returning fallback');
      return getFallbackSports();
    }
    
    const reorderedData = filterAndReorderSports(sports);
    setCachedData(cacheKey, reorderedData);
    console.log(`✅ Fetched ${reorderedData.length} sports from SSSS API`);
    return reorderedData;
  } catch (error) {
    console.error('❌ Error fetching sports from SSSS API:', error);
    console.log('📡 Returning fallback sports data');
    return getFallbackSports();
  }
};

// Fallback sports data in case API fails
const getFallbackSports = (): Sport[] => {
  return [
    { id: 'football', name: 'Football' },
    { id: 'basketball', name: 'Basketball' },
    { id: 'american-football', name: 'American Football' },
    { id: 'hockey', name: 'Hockey' },
    { id: 'baseball', name: 'Baseball' },
    { id: 'motor-sports', name: 'Motor Sports' },
    { id: 'fight', name: 'Fight (UFC, Boxing)' },
    { id: 'tennis', name: 'Tennis' },
    { id: 'rugby', name: 'Rugby' },
    { id: 'cricket', name: 'Cricket' },
    { id: 'other', name: 'Other' }
  ];
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-ssss-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${SSSS_API_BASE}/stream/list?language=en&access-token=${SSSS_ACCESS_TOKEN}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    console.log('📡 SSSS API Matches Response:', data);
    
    // Handle different response formats
    let streams = [];
    if (Array.isArray(data)) {
      streams = data;
    } else if (data && typeof data === 'object') {
      // Check for common array properties
      if (data.streams && Array.isArray(data.streams)) {
        streams = data.streams;
      } else if (data.data && Array.isArray(data.data)) {
        streams = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        streams = data.results;
      } else {
        // Try to extract array values
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
          streams = values[0];
        }
      }
    }
    
    if (!Array.isArray(streams)) {
      console.warn('⚠️ No valid streams array found in SSSS API response');
      return [];
    }
    
    // Transform streams to matches and filter by sport
    const allMatches = streams
      .filter((stream: any) => stream && stream.id && stream.name)
      .map(transformSSSSStreamToMatch);
    
    // Filter by requested sport
    const filteredMatches = sportId === 'all' ? allMatches : allMatches.filter(match => {
      const matchCategory = match.category.toLowerCase().replace(/\s+/g, '-');
      const requestedSport = sportId.toLowerCase();
      
      return matchCategory === requestedSport || matchCategory.includes(requestedSport) || requestedSport.includes(matchCategory);
    });
    
    setCachedData(cacheKey, filteredMatches);
    console.log(`✅ Fetched ${filteredMatches.length} matches for sport ${sportId} from SSSS API`);
    return filteredMatches;
  } catch (error) {
    console.error(`❌ Error fetching matches for sport ${sportId} from SSSS API:`, error);
    throw error;
  }
};

export const fetchLiveMatches = async (): Promise<Match[]> => {
  const cacheKey = 'matches-ssss-live';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${SSSS_API_BASE}/stream/list?language=en&access-token=${SSSS_ACCESS_TOKEN}`, {
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    console.log('📡 SSSS API Live Response:', data);
    
    // Handle different response formats
    let streams = [];
    if (Array.isArray(data)) {
      streams = data;
    } else if (data && typeof data === 'object') {
      if (data.streams && Array.isArray(data.streams)) {
        streams = data.streams;
      } else if (data.data && Array.isArray(data.data)) {
        streams = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        streams = data.results;
      } else {
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
          streams = values[0];
        }
      }
    }
    
    if (!Array.isArray(streams)) {
      console.warn('⚠️ No valid streams found in SSSS API live response');
      return [];
    }
    
    // All SSSS streams are considered live
    const liveMatches = streams
      .filter((stream: any) => stream && stream.id && stream.name)
      .map(transformSSSSStreamToMatch);
    
    setCachedData(cacheKey, liveMatches);
    console.log(`✅ Fetched ${liveMatches.length} live matches from SSSS API`);
    return liveMatches;
  } catch (error) {
    console.error('❌ Error fetching live matches from SSSS API:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  return fetchLiveMatches(); // SSSS API only provides live streams
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  const cacheKey = `match-ssss-${sportId}-${matchId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // Get all matches for this sport and find the specific match
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
  // For SSSS API, we use direct damitv.pro embeds
  const cacheKey = `stream-ssss-${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`📡 Creating SSSS stream for id=${id}`);
    
    // Create stream object for damitv.pro embed
    const stream: Stream = {
      id: id,
      streamNo: 1,
      language: 'en',
      hd: true,
      embedUrl: `https://damitv.pro/embed/${id}`,
      source: 'ssss'
    };
    
    setCachedData(cacheKey, stream);
    console.log(`✅ Created SSSS stream for ${id}`);
    return stream;
  } catch (error) {
    console.error(`❌ Error creating SSSS stream for ${id}:`, error);
    throw error;
  }
};

// Helper function to check if URL is valid
function isValidStreamUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http') || url.startsWith('//');
}
