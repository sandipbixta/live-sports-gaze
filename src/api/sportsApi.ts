
import { Sport, Match, Stream, Source } from '../types/sports';

const API_BASE = 'https://api.cdn-live.tv/api/v1/vip/damitv';

// Cache for API responses to avoid repeated calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to clear cache (used for refresh)
export const clearStreamCache = (matchId?: string) => {
  if (matchId) {
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes(matchId) || key.includes('stream')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
    console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for match: ${matchId}`);
  } else {
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes('stream')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
    console.log(`🗑️ Cleared ${keysToDelete.length} stream cache entries`);
  }
};

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

// Map sport IDs to API endpoints
const sportEndpointMap: Record<string, string> = {
  'football': 'football',
  'soccer': 'football',
  'basketball': 'nba',
  'nba': 'nba',
  'american-football': 'nfl',
  'nfl': 'nfl',
  'hockey': 'nhl',
  'nhl': 'nhl',
  'all': 'sports'
};

// Sport name mapping for the API
const sportNameMap: Record<string, string> = {
  'Soccer': 'football',
  'Football': 'football',
  'Basketball': 'basketball',
  'NBA': 'basketball',
  'NFL': 'american-football',
  'American Football': 'american-football',
  'NHL': 'hockey',
  'Hockey': 'hockey',
  'Tennis': 'tennis',
  'Cricket': 'cricket',
  'Boxing': 'boxing',
  'MMA': 'mma',
  'UFC': 'mma',
  'Rugby': 'rugby',
  'Motorsport': 'motorsport',
  'F1': 'motorsport'
};

// Transform API response to Match format
const transformMatch = (event: any, sportId: string): Match => {
  // Build sources array from channels data
  const sources: Source[] = [];
  
  if (event.channels && Array.isArray(event.channels)) {
    event.channels.forEach((channel: any, index: number) => {
      sources.push({
        source: channel.channel_name || channel.channel_code || 'Stream',
        id: channel.url || `channel-${index}`,
        name: channel.channel_name || channel.channel_code || `Stream ${index + 1}`
      });
    });
  }
  
  // If no channels, create a default source from the event ID
  if (sources.length === 0 && event.gameID) {
    sources.push({
      source: 'default',
      id: event.gameID,
      name: 'Stream 1'
    });
  }

  // Parse date from start field (format: "2025-12-08 11:30")
  let matchDate = Date.now();
  if (event.start) {
    const parsed = new Date(event.start.replace(' ', 'T') + ':00Z');
    if (!isNaN(parsed.getTime())) {
      matchDate = parsed.getTime();
    }
  }

  // Create title from team names
  const title = event.homeTeam && event.awayTeam 
    ? `${event.homeTeam} vs ${event.awayTeam}`
    : event.title || event.name || '';

  return {
    id: event.gameID || String(event.id || event._id || ''),
    title,
    category: event.tournament || event.category || sportId,
    date: matchDate,
    // Only use actual poster images, not team images (those go in badges)
    poster: event.poster || event.image || undefined,
    popular: event.popular || event.featured || false,
    teams: {
      home: {
        name: event.homeTeam || '',
        badge: event.homeTeamIMG || ''
      },
      away: {
        name: event.awayTeam || '',
        badge: event.awayTeamIMG || ''
      }
    },
    sources,
    sportId: sportNameMap[sportId] || sportId.toLowerCase(),
    isLive: event.status === 'live' || event.status === 'playing',
    viewerCount: event.channels?.reduce((sum: number, ch: any) => sum + (parseInt(ch.viewers) || 0), 0) || 0
  };
};

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'sports';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  // Return static sports list since the new API uses specific endpoints per sport
  const sports: Sport[] = [
    { id: 'football', name: 'Football' },
    { id: 'basketball', name: 'Basketball' },
    { id: 'american-football', name: 'American Football' },
    { id: 'hockey', name: 'Hockey' }
  ];

  setCachedData(cacheKey, sports);
  console.log(`✅ Loaded ${sports.length} sports`);
  return sports;
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `matches-${sportId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const timeout = isMobile ? 20000 : 15000;

  // Map sportId to API endpoint
  const endpoint = sportEndpointMap[sportId.toLowerCase()] || 'sports';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE}/events/${endpoint}/`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    // Handle the cdn-live.tv response format: {"cdn-live-tv": {"Soccer": [...], "Basketball": [...]}}
    let allMatches: Match[] = [];
    
    if (data['cdn-live-tv'] && typeof data['cdn-live-tv'] === 'object') {
      Object.entries(data['cdn-live-tv']).forEach(([sportName, events]) => {
        if (Array.isArray(events)) {
          const sportMatches = events
            .filter((event: any) => event && (event.gameID || event.id))
            .map((event: any) => transformMatch(event, sportName));
          allMatches = allMatches.concat(sportMatches);
        }
      });
    } else if (Array.isArray(data)) {
      allMatches = data
        .filter((event: any) => event && (event.gameID || event.id))
        .map((event: any) => transformMatch(event, sportId));
    }
    
    setCachedData(cacheKey, allMatches);
    console.log(`✅ Fetched ${allMatches.length} matches for sport ${sportId} from cdn-live.tv API`);
    return allMatches;
  } catch (error) {
    console.error(`❌ Error fetching matches for sport ${sportId}:`, error);
    throw error;
  }
};

export const fetchLiveMatches = async (): Promise<Match[]> => {
  return fetchAllMatches();
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  const cacheKey = 'matches-all';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE}/events/sports/`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    // Handle the cdn-live.tv response format: {"cdn-live-tv": {"Soccer": [...], "Basketball": [...]}}
    let allMatches: Match[] = [];
    
    if (data['cdn-live-tv'] && typeof data['cdn-live-tv'] === 'object') {
      // API returns sports as keys with arrays of events
      Object.entries(data['cdn-live-tv']).forEach(([sportName, events]) => {
        if (Array.isArray(events)) {
          const sportMatches = events
            .filter((event: any) => event && (event.gameID || event.id))
            .map((event: any) => transformMatch(event, sportName));
          allMatches = allMatches.concat(sportMatches);
        }
      });
    } else if (Array.isArray(data)) {
      allMatches = data
        .filter((event: any) => event && (event.gameID || event.id))
        .map((event: any) => transformMatch(event, 'all'));
    }
    
    // Sort by date (most recent first) and filter out finished matches
    allMatches = allMatches
      .filter(m => m.isLive || new Date(m.date) > new Date(Date.now() - 3 * 60 * 60 * 1000)) // Include live or started within 3 hours
      .sort((a, b) => {
        // Live matches first
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        // Then by date
        return a.date - b.date;
      });
    
    setCachedData(cacheKey, allMatches);
    console.log(`✅ Fetched ${allMatches.length} matches from cdn-live.tv API`);
    return allMatches;
  } catch (error) {
    console.error('❌ Error fetching all matches:', error);
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

    // If not in cache, fetch all matches and find the specific match
    const allMatches = await fetchAllMatches();
    const match = allMatches.find(m => m.id === matchId);
    
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

// Fetch streams for a specific event
export const fetchSimpleStream = async (source: string, id: string): Promise<Stream[]> => {
  const cacheKey = `simple-stream-${source}-${id}`;
  
  try {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    console.log(`🎬 Fetching streams for ${source}/${id}`);
    
    // Try to get match data which should contain stream URLs
    const allMatches = await fetchAllMatches();
    const match = allMatches.find(m => m.id === id || m.sources?.some(s => s.id === id));
    
    if (match && match.sources && match.sources.length > 0) {
      const streams: Stream[] = match.sources.map((src, index) => ({
        id: src.id,
        streamNo: index + 1,
        language: 'EN',
        hd: true,
        embedUrl: src.id.startsWith('http') ? src.id : `${API_BASE}/channels/player/?name=${encodeURIComponent(src.source)}&code=us`,
        source: src.source,
        name: src.name || src.source,
        timestamp: Date.now()
      }));
      
      setCachedData(cacheKey, streams);
      console.log(`✅ Found ${streams.length} streams for ${id}`);
      return streams;
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching streams for ${source}/${id}:`, error);
    return [];
  }
};

export const fetchAllMatchStreams = async (match: Match): Promise<{
  streams: Stream[];
  sourcesChecked: number;
  sourcesWithStreams: number;
  sourceNames: string[];
}> => {
  const allStreams: Stream[] = [];
  const sourcesWithStreams = new Set<string>();
  
  if (match.sources && match.sources.length > 0) {
    match.sources.forEach((source, index) => {
      const stream: Stream = {
        id: source.id,
        streamNo: index + 1,
        language: 'EN',
        hd: true,
        embedUrl: source.id.startsWith('http') ? source.id : `${API_BASE}/channels/player/?name=${encodeURIComponent(source.source)}&code=us`,
        source: source.source,
        name: source.name || source.source,
        timestamp: Date.now()
      };
      allStreams.push(stream);
      sourcesWithStreams.add(source.source);
    });
  }

  const sourceNames = Array.from(sourcesWithStreams);
  console.log(`🎬 Total streams found: ${allStreams.length} from ${sourceNames.length} sources`);
  
  return {
    streams: allStreams,
    sourcesChecked: match.sources?.length || 0,
    sourcesWithStreams: sourceNames.length,
    sourceNames
  };
};

// Fetch all streams from all available sources for a match
export const fetchAllStreams = async (match: Match): Promise<Record<string, Stream[]>> => {
  if (!match.sources || match.sources.length === 0) {
    throw new Error('No sources available for this match');
  }

  const allStreams: Record<string, Stream[]> = {};
  
  match.sources.forEach((source, index) => {
    const sourceKey = `${source.source}/${source.id}`;
    const stream: Stream = {
      id: source.id,
      streamNo: index + 1,
      language: 'EN',
      hd: true,
      embedUrl: source.id.startsWith('http') ? source.id : `${API_BASE}/channels/player/?name=${encodeURIComponent(source.source)}&code=us`,
      source: source.source,
      name: source.name || source.source,
      timestamp: Date.now()
    };
    
    if (!allStreams[sourceKey]) {
      allStreams[sourceKey] = [];
    }
    allStreams[sourceKey].push(stream);
  });

  console.log(`🎯 Total streams from ${Object.keys(allStreams).length} sources for match: ${match.title}`);
  return allStreams;
};

// Fetch TV channels
export const fetchChannels = async (): Promise<any[]> => {
  const cacheKey = 'channels';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE}/channels/`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    // Handle different response formats
    let channels: any[] = [];
    if (Array.isArray(data)) {
      channels = data;
    } else if (data.channels && Array.isArray(data.channels)) {
      channels = data.channels;
    } else if (data.data && Array.isArray(data.data)) {
      channels = data.data;
    }
    
    setCachedData(cacheKey, channels);
    console.log(`✅ Fetched ${channels.length} channels from cdn-live.tv API`);
    return channels;
  } catch (error) {
    console.error('❌ Error fetching channels:', error);
    throw error;
  }
};

// Export alias for backward compatibility
export const fetchStream = fetchSimpleStream;
