
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
  return {
    id: stream.id?.toString() || '',
    title: stream.name || 'Unknown Stream',
    category: stream.category || 'other',
    date: Date.now(), // SSSS streams appear to be live
    poster: stream.poster || '',
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
    const response = await fetch(`${SSSS_API_BASE}/stream/list?language=en&access-token=${SSSS_ACCESS_TOKEN}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid SSSS API data format');
    }
    
    // Extract unique categories/sports from streams
    const sportsMap = new Map<string, Sport>();
    
    data.forEach((stream: any) => {
      if (stream.category && stream.name) {
        const sportId = stream.category.toLowerCase().replace(/\s+/g, '-');
        const sportName = stream.category;
        
        if (!sportsMap.has(sportId)) {
          sportsMap.set(sportId, {
            id: sportId,
            name: sportName
          });
        }
      }
    });
    
    const sports = Array.from(sportsMap.values());
    const reorderedData = filterAndReorderSports(sports);
    setCachedData(cacheKey, reorderedData);
    console.log(`✅ Fetched ${reorderedData.length} sports from SSSS API`);
    return reorderedData;
  } catch (error) {
    console.error('❌ Error fetching sports from SSSS API:', error);
    throw error;
  }
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
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid SSSS API data format');
    }
    
    // Transform streams to matches and filter by sport
    const allMatches = data
      .filter((stream: any) => stream && stream.id && stream.name && stream.category)
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
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid SSSS API data format');
    }
    
    // All SSSS streams are considered live
    const liveMatches = data
      .filter((stream: any) => stream && stream.id && stream.name && stream.category)
      .map(transformSSSSStreamToMatch);
    
    setCachedData(cacheKey, liveMatches);
    console.log(`✅ Fetched ${liveMatches.length} live matches from SSSS API`);
    return liveMatches;
  } catch (error) {
    console.error('❌ Error fetching live matches from SSSS API:', error);
    throw error;
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
