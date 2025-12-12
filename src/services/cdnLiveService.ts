const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1/vip/damitv';
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/751945';

// ============================================
// TYPES
// ============================================

export interface CDNChannel {
  name: string;
  code: string;
  url: string;
  image: string | null;
  viewers: number;
}

export interface CDNEvent {
  id: string;
  title: string;
  competition?: string;
  league?: string;
  home_team?: string;
  away_team?: string;
  home_badge?: string;
  away_badge?: string;
  poster?: string;
  image?: string;
  start_time?: string;
  date?: string;
  time?: string;
  status?: 'live' | 'upcoming' | 'finished' | string;
  is_live?: boolean;
  channels?: CDNChannel[];
  sources?: any[];
  stream_url?: string;
}

export interface CDNEventsResponse {
  events?: CDNEvent[];
  matches?: CDNEvent[];
  data?: CDNEvent[];
  total?: number;
}

export interface CDNChannelsResponse {
  total_channels: number;
  channels: CDNChannel[];
}

// ============================================
// CACHE
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 60 * 1000; // 1 minute

const getCached = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  return null;
};

const setCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ============================================
// FETCH HELPER
// ============================================

const fetchCDNLive = async <T>(endpoint: string): Promise<T | null> => {
  const cacheKey = `cdn_${endpoint}`;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${CDN_LIVE_API}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`CDN-Live API error: ${response.status} for ${endpoint}`);
      return null;
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch CDN-Live ${endpoint}:`, error);
    return null;
  }
};

// ============================================
// CHANNELS
// ============================================

export const getChannels = async (): Promise<CDNChannel[]> => {
  const data = await fetchCDNLive<CDNChannelsResponse>('/channels/');
  return data?.channels || [];
};

export const getPopularChannels = async (limit: number = 20): Promise<CDNChannel[]> => {
  const channels = await getChannels();
  return channels
    .filter(ch => ch.viewers > 0)
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, limit);
};

export const getSportsChannels = async (): Promise<CDNChannel[]> => {
  const channels = await getChannels();
  const sportsKeywords = ['sport', 'espn', 'fox', 'sky', 'bein', 'btn', 'nba', 'nfl', 'nhl', 'mlb', 'golf', 'tennis', 'cricket', 'football'];
  
  return channels.filter(ch => 
    sportsKeywords.some(keyword => 
      ch.name.toLowerCase().includes(keyword)
    )
  );
};

// ============================================
// EVENTS
// ============================================

export const getAllSportsEvents = async (): Promise<CDNEvent[]> => {
  const data = await fetchCDNLive<CDNEventsResponse>('/events/sports/');
  return data?.events || data?.matches || data?.data || [];
};

export const getFootballEvents = async (): Promise<CDNEvent[]> => {
  const data = await fetchCDNLive<CDNEventsResponse>('/events/football/');
  return data?.events || data?.matches || data?.data || [];
};

export const getNBAEvents = async (): Promise<CDNEvent[]> => {
  const data = await fetchCDNLive<CDNEventsResponse>('/events/nba/');
  return data?.events || data?.matches || data?.data || [];
};

export const getNFLEvents = async (): Promise<CDNEvent[]> => {
  const data = await fetchCDNLive<CDNEventsResponse>('/events/nfl/');
  return data?.events || data?.matches || data?.data || [];
};

export const getNHLEvents = async (): Promise<CDNEvent[]> => {
  const data = await fetchCDNLive<CDNEventsResponse>('/events/nhl/');
  return data?.events || data?.matches || data?.data || [];
};

export const getEventsBySport = async (sport: string): Promise<CDNEvent[]> => {
  const data = await fetchCDNLive<CDNEventsResponse>(`/events/${sport}/`);
  return data?.events || data?.matches || data?.data || [];
};

// ============================================
// FETCH TEAM BADGE FROM THESPORTSDB (Fallback)
// ============================================

const badgeCache = new Map<string, string | null>();

export const fetchTeamBadge = async (teamName: string): Promise<string | null> => {
  if (!teamName) return null;
  
  const cacheKey = teamName.toLowerCase().trim();
  if (badgeCache.has(cacheKey)) {
    return badgeCache.get(cacheKey) || null;
  }

  try {
    const response = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.teams && data.teams.length > 0) {
        const badge = data.teams[0].strBadge || data.teams[0].strTeamBadge || null;
        badgeCache.set(cacheKey, badge);
        return badge;
      }
    }
  } catch (e) {
    // Ignore
  }

  badgeCache.set(cacheKey, null);
  return null;
};

// ============================================
// FETCH EVENT POSTER FROM THESPORTSDB (Fallback)
// ============================================

export const fetchEventPoster = async (homeTeam: string, awayTeam: string): Promise<string | null> => {
  if (!homeTeam || !awayTeam) return null;

  const cacheKey = `poster_${homeTeam}_${awayTeam}`;
  if (badgeCache.has(cacheKey)) {
    return badgeCache.get(cacheKey) || null;
  }

  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
    const response = await fetch(
      `${SPORTSDB_API}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.event && data.event.length > 0) {
        const event = data.event[0];
        const poster = event.strThumb || event.strPoster || event.strBanner || null;
        badgeCache.set(cacheKey, poster);
        return poster;
      }
    }
  } catch (e) {
    // Ignore
  }

  badgeCache.set(cacheKey, null);
  return null;
};

// ============================================
// FORMAT EVENT FOR DISPLAY
// ============================================

export interface FormattedCDNEvent {
  id: string;
  title: string;
  sport: string;
  competition: string;
  homeTeam: {
    name: string;
    badge: string | null;
  };
  awayTeam: {
    name: string;
    badge: string | null;
  };
  date: Date;
  isLive: boolean;
  status: string;
  poster: string | null;
  streamUrl: string | null;
  channels: CDNChannel[];
}

export const formatCDNEvent = (event: CDNEvent, sport: string = 'sports'): FormattedCDNEvent => {
  let homeTeam = event.home_team || '';
  let awayTeam = event.away_team || '';
  
  if (!homeTeam && !awayTeam && event.title) {
    const parts = event.title.split(/\s+vs\.?\s+|\s+-\s+/i);
    if (parts.length >= 2) {
      homeTeam = parts[0].trim();
      awayTeam = parts[1].trim();
    }
  }

  let date = new Date();
  if (event.start_time) {
    date = new Date(event.start_time);
  } else if (event.date && event.time) {
    date = new Date(`${event.date}T${event.time}`);
  } else if (event.date) {
    date = new Date(event.date);
  }

  const isLive = event.is_live || 
                 event.status === 'live' || 
                 event.status === 'LIVE' ||
                 event.status === 'IN_PLAY';

  return {
    id: event.id || `cdn-${Date.now()}-${Math.random()}`,
    title: event.title || `${homeTeam} vs ${awayTeam}`,
    sport,
    competition: event.competition || event.league || sport,
    homeTeam: {
      name: homeTeam || 'TBD',
      badge: event.home_badge || null,
    },
    awayTeam: {
      name: awayTeam || 'TBD',
      badge: event.away_badge || null,
    },
    date,
    isLive,
    status: event.status || (isLive ? 'live' : 'upcoming'),
    poster: event.poster || event.image || null,
    streamUrl: event.stream_url || null,
    channels: event.channels || [],
  };
};

// ============================================
// GET FEATURED EVENTS (Combined from all sports)
// ============================================

export const getFeaturedCDNEvents = async (limit: number = 12): Promise<FormattedCDNEvent[]> => {
  try {
    const [allSports, football, nba, nfl, nhl] = await Promise.all([
      getAllSportsEvents(),
      getFootballEvents(),
      getNBAEvents(),
      getNFLEvents(),
      getNHLEvents(),
    ]);

    const allEvents: (CDNEvent & { _sport?: string })[] = [];
    const seenIds = new Set<string>();

    const addEvents = (events: CDNEvent[], sport: string) => {
      events.forEach(event => {
        const id = event.id || event.title;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          allEvents.push({ ...event, _sport: sport });
        }
      });
    };

    addEvents(football, 'football');
    addEvents(nba, 'basketball');
    addEvents(nfl, 'nfl');
    addEvents(nhl, 'hockey');
    addEvents(allSports, 'sports');

    const now = Date.now();
    allEvents.sort((a, b) => {
      const aLive = a.is_live || a.status === 'live';
      const bLive = b.is_live || b.status === 'live';
      
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;

      const aDate = new Date(a.start_time || a.date || now).getTime();
      const bDate = new Date(b.start_time || b.date || now).getTime();
      return aDate - bDate;
    });

    return allEvents.slice(0, limit).map(event => 
      formatCDNEvent(event, event._sport || 'sports')
    );
  } catch (error) {
    console.error('Failed to get featured CDN events:', error);
    return [];
  }
};

// ============================================
// ENHANCE EVENTS WITH THESPORTSDB IMAGES
// ============================================

export const enhanceEventWithImages = async (event: FormattedCDNEvent): Promise<FormattedCDNEvent> => {
  if (event.homeTeam.badge && event.awayTeam.badge && event.poster) {
    return event;
  }

  const [homeBadge, awayBadge, poster] = await Promise.all([
    event.homeTeam.badge ? Promise.resolve(event.homeTeam.badge) : fetchTeamBadge(event.homeTeam.name),
    event.awayTeam.badge ? Promise.resolve(event.awayTeam.badge) : fetchTeamBadge(event.awayTeam.name),
    event.poster ? Promise.resolve(event.poster) : fetchEventPoster(event.homeTeam.name, event.awayTeam.name),
  ]);

  return {
    ...event,
    homeTeam: { ...event.homeTeam, badge: homeBadge },
    awayTeam: { ...event.awayTeam, badge: awayBadge },
    poster,
  };
};

export const getFeaturedCDNEventsWithImages = async (limit: number = 12): Promise<FormattedCDNEvent[]> => {
  const events = await getFeaturedCDNEvents(limit);
  
  const enhanced = await Promise.all(
    events.slice(0, 8).map(enhanceEventWithImages)
  );
  
  return [...enhanced, ...events.slice(8)];
};
