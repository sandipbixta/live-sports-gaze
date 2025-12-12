// Unified Sports API - Combines WeStream + CDN-Live.tv APIs
import { Sport, Match, Stream, Source, MatchChannel } from '../types/sports';

// API Base URLs
const WESTREAM_API = 'https://westream.nu';
const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1/vip/damitv';

// Cache configuration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for fresher data
const CHANNEL_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for channels

// ============================================
// CACHE HELPERS
// ============================================

const getCached = <T>(key: string, duration = CACHE_DURATION): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data as T;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (pattern?: string) => {
  if (pattern) {
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes(pattern)) keysToDelete.push(key);
    });
    keysToDelete.forEach(key => cache.delete(key));
  } else {
    cache.clear();
  }
};

// ============================================
// TYPES
// ============================================

export interface Channel {
  name: string;
  code: string;
  url: string;
  image: string | null;
  viewers: number;
  category?: string;
}

export interface CDNEvent {
  id: string;
  title: string;
  teams?: {
    home?: { name: string; badge?: string };
    away?: { name: string; badge?: string };
  };
  date: number;
  category: string;
  league?: string;
  channels?: MatchChannel[];
  poster?: string;
}

// ============================================
// WESTREAM API
// ============================================

const fetchWeStream = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${WESTREAM_API}${endpoint}`, {
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`WeStream API error (${endpoint}):`, error);
    return null;
  }
};

// ============================================
// CDN-LIVE API
// ============================================

const fetchCDN = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${CDN_LIVE_API}${endpoint}`, {
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`CDN-Live API error (${endpoint}):`, error);
    return null;
  }
};

// ============================================
// CHANNELS API (CDN-Live.tv)
// ============================================

export const fetchChannels = async (): Promise<Channel[]> => {
  const cacheKey = 'cdn-channels';
  const cached = getCached<Channel[]>(cacheKey, CHANNEL_CACHE_DURATION);
  if (cached) return cached;

  const data = await fetchCDN<{ total_channels: number; channels: Channel[] }>('/channels/');
  const channels = data?.channels || [];
  
  // Sort by viewers (most popular first)
  channels.sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
  
  setCache(cacheKey, channels);
  console.log(`✅ Loaded ${channels.length} channels from CDN-Live`);
  return channels;
};

// ============================================
// EVENTS/MATCHES API (CDN-Live.tv)
// ============================================

const transformCDNEvent = (event: any, category: string): Match => ({
  id: event.id || `cdn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: event.title || `${event.teams?.home?.name || 'TBA'} vs ${event.teams?.away?.name || 'TBA'}`,
  category: category,
  date: event.date || Date.now(),
  poster: event.poster || event.image,
  popular: event.popular || false,
  teams: event.teams ? {
    home: { 
      name: event.teams.home?.name || '', 
      badge: event.teams.home?.badge || event.teams.home?.logo 
    },
    away: { 
      name: event.teams.away?.name || '', 
      badge: event.teams.away?.badge || event.teams.away?.logo 
    }
  } : undefined,
  sources: [],
  sportId: category.toLowerCase().replace(/\s+/g, '-'),
  isLive: event.isLive || (event.date && event.date <= Date.now() && event.date > Date.now() - 3 * 60 * 60 * 1000),
  viewerCount: event.viewers || 0,
  tournament: event.league || event.tournament,
  channels: event.channels || []
});

export const fetchCDNEvents = async (category: string = 'sports'): Promise<Match[]> => {
  const cacheKey = `cdn-events-${category}`;
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  const endpoint = `/events/${category}/`;
  const data = await fetchCDN<any[]>(endpoint);
  
  if (!data || !Array.isArray(data)) return [];
  
  const matches = data.map(event => transformCDNEvent(event, category));
  setCache(cacheKey, matches);
  
  console.log(`✅ Loaded ${matches.length} ${category} events from CDN-Live`);
  return matches;
};

export const fetchAllCDNEvents = async (): Promise<Match[]> => {
  const cacheKey = 'cdn-all-events';
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  // Fetch all sports categories in parallel
  const [sports, football, nba, nfl, nhl] = await Promise.all([
    fetchCDNEvents('sports'),
    fetchCDNEvents('football'),
    fetchCDNEvents('nba'),
    fetchCDNEvents('nfl'),
    fetchCDNEvents('nhl')
  ]);

  const allEvents = [...sports, ...football, ...nba, ...nfl, ...nhl];
  
  // Remove duplicates by ID
  const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values());
  
  setCache(cacheKey, uniqueEvents);
  console.log(`✅ Loaded ${uniqueEvents.length} total CDN events`);
  return uniqueEvents;
};

// ============================================
// WESTREAM MATCHES API
// ============================================

const transformWeStreamMatch = (match: any): Match => ({
  id: match.id || String(match._id || ''),
  title: match.title || (match.teams ? `${match.teams.home?.name || ''} vs ${match.teams.away?.name || ''}` : ''),
  category: match.category || 'Unknown',
  date: match.date ? (typeof match.date === 'number' ? match.date : new Date(match.date).getTime()) : Date.now(),
  poster: match.poster || match.image,
  popular: match.popular || false,
  teams: match.teams ? {
    home: { 
      name: match.teams.home?.name || '', 
      badge: match.teams.home?.badge || match.teams.home?.logo 
    },
    away: { 
      name: match.teams.away?.name || '', 
      badge: match.teams.away?.badge || match.teams.away?.logo 
    }
  } : undefined,
  sources: match.sources?.map((s: any) => ({
    source: s.source,
    id: s.id,
    name: s.name || s.source
  })) || [],
  sportId: match.category?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
  isLive: match.isLive || false,
  viewerCount: match.viewerCount || match.viewers || 0,
  tournament: match.tournament || match.league
});

export const fetchSports = async (): Promise<Sport[]> => {
  const cacheKey = 'westream-sports';
  const cached = getCached<Sport[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchWeStream<any[]>('/sports');
  
  if (!data) {
    // Fallback sports list
    return [
      { id: 'football', name: 'Football' },
      { id: 'basketball', name: 'Basketball' },
      { id: 'nba', name: 'NBA' },
      { id: 'nfl', name: 'NFL' },
      { id: 'nhl', name: 'NHL' },
      { id: 'tennis', name: 'Tennis' },
      { id: 'cricket', name: 'Cricket' },
      { id: 'boxing', name: 'Boxing' },
      { id: 'mma', name: 'MMA' },
      { id: 'motorsport', name: 'Motorsport' }
    ];
  }

  const sports = data.map((sport: any) => ({
    id: sport.id || sport.name?.toLowerCase().replace(/\s+/g, '-'),
    name: sport.name || sport.id
  }));

  // Sort with popular sports first
  sports.sort((a, b) => {
    const priority = ['football', 'nba', 'nfl', 'nhl', 'basketball', 'tennis', 'cricket'];
    const aIndex = priority.indexOf(a.id);
    const bIndex = priority.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  setCache(cacheKey, sports);
  return sports;
};

export const fetchAllMatches = async (): Promise<Match[]> => {
  const cacheKey = 'westream-all-matches';
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchWeStream<any[]>('/matches');
  if (!data) return [];

  const matches = data.map(transformWeStreamMatch);
  
  // Sort: Live first, then by date
  matches.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return a.date - b.date;
  });

  setCache(cacheKey, matches);
  return matches;
};

export const fetchLiveMatches = async (): Promise<Match[]> => {
  const cacheKey = 'westream-live-matches';
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchWeStream<any[]>('/matches/live');
  if (!data) return [];

  const matches = Array.isArray(data) ? data.map(transformWeStreamMatch) : [transformWeStreamMatch(data)];
  
  setCache(cacheKey, matches);
  return matches;
};

export const fetchMatchesBySport = async (sportId: string): Promise<Match[]> => {
  const cacheKey = `westream-matches-${sportId}`;
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchWeStream<any[]>(`/matches/${sportId}`);
  if (!data) return [];

  const matches = data.map(transformWeStreamMatch);
  setCache(cacheKey, matches);
  return matches;
};

// ============================================
// UNIFIED MATCHES (Combined from both APIs)
// ============================================

export const fetchUnifiedMatches = async (): Promise<Match[]> => {
  const cacheKey = 'unified-all-matches';
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  // Fetch from both APIs in parallel
  const [weStreamMatches, cdnMatches] = await Promise.all([
    fetchAllMatches(),
    fetchAllCDNEvents()
  ]);

  // Combine and deduplicate (WeStream takes priority for streams)
  const matchMap = new Map<string, Match>();
  
  // Add CDN matches first
  cdnMatches.forEach(match => {
    const key = `${match.teams?.home?.name?.toLowerCase()}-${match.teams?.away?.name?.toLowerCase()}`;
    matchMap.set(key, match);
  });
  
  // WeStream matches override/merge (they have stream sources)
  weStreamMatches.forEach(match => {
    const key = `${match.teams?.home?.name?.toLowerCase()}-${match.teams?.away?.name?.toLowerCase()}`;
    const existing = matchMap.get(key);
    if (existing) {
      // Merge: keep CDN channels, add WeStream sources
      matchMap.set(key, {
        ...existing,
        ...match,
        channels: existing.channels,
        sources: match.sources
      });
    } else {
      matchMap.set(match.id, match);
    }
  });

  const allMatches = Array.from(matchMap.values());
  
  // Sort: Live first, popular second, then by date
  allMatches.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.date - b.date;
  });

  setCache(cacheKey, allMatches);
  console.log(`✅ Unified ${allMatches.length} matches from both APIs`);
  return allMatches;
};

export const fetchUnifiedLiveMatches = async (): Promise<Match[]> => {
  const cacheKey = 'unified-live-matches';
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  const allMatches = await fetchUnifiedMatches();
  const now = Date.now();
  const threeHoursAgo = now - 3 * 60 * 60 * 1000;
  
  const liveMatches = allMatches.filter(match => 
    match.isLive || (match.date <= now && match.date > threeHoursAgo)
  );

  setCache(cacheKey, liveMatches);
  return liveMatches;
};

// ============================================
// STREAM API (WeStream)
// ============================================

export const fetchStream = async (source: string, id: string): Promise<Stream[]> => {
  const cacheKey = `stream-${source}-${id}`;
  const cached = getCached<Stream[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchWeStream<any[]>(`/stream/${source}/${id}`);
  if (!data) return [];

  const streams: Stream[] = data.map((stream: any, index: number) => ({
    id: stream.id || `${source}-${id}-${index}`,
    streamNo: stream.streamNo || index + 1,
    language: stream.language || 'EN',
    hd: stream.hd !== false,
    embedUrl: stream.embedUrl || stream.url || '',
    source: stream.source || source,
    name: stream.name || `Stream ${index + 1}`,
    timestamp: Date.now()
  }));

  setCache(cacheKey, streams);
  return streams;
};

export const fetchAllStreamsForMatch = async (match: Match): Promise<{
  streams: Stream[];
  sourcesWithStreams: string[];
}> => {
  if (!match.sources || match.sources.length === 0) {
    return { streams: [], sourcesWithStreams: [] };
  }

  const allStreams: Stream[] = [];
  const sourcesWithStreams: string[] = [];

  const results = await Promise.all(
    match.sources.map(async (source) => {
      const streams = await fetchStream(source.source, source.id);
      if (streams.length > 0) {
        sourcesWithStreams.push(source.source);
      }
      return streams;
    })
  );

  results.forEach(streams => allStreams.push(...streams));

  return { streams: allStreams, sourcesWithStreams };
};

// ============================================
// FEATURED/POPULAR
// ============================================

export const fetchFeaturedMatches = async (limit = 12): Promise<Match[]> => {
  const allMatches = await fetchUnifiedMatches();
  
  const now = Date.now();
  const featured: Match[] = [];
  
  // Priority 1: Live popular matches
  const livePopular = allMatches.filter(m => m.isLive && m.popular);
  featured.push(...livePopular);
  
  // Priority 2: Live matches
  const liveOther = allMatches.filter(m => m.isLive && !m.popular);
  featured.push(...liveOther);
  
  // Priority 3: Upcoming popular
  const upcomingPopular = allMatches.filter(m => !m.isLive && m.popular && m.date > now);
  featured.push(...upcomingPopular);
  
  // Priority 4: Upcoming soon
  const upcomingSoon = allMatches
    .filter(m => !m.isLive && !m.popular && m.date > now)
    .slice(0, 20);
  featured.push(...upcomingSoon);
  
  return featured.slice(0, limit);
};

export const fetchPopularChannels = async (limit = 20): Promise<Channel[]> => {
  const channels = await fetchChannels();
  return channels.filter(c => c.viewers > 0).slice(0, limit);
};

// Export backward compatible functions
export { fetchChannels as getChannels };
