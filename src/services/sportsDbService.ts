// TheSportsDB API service for fetching match posters and team images
const SPORTS_DB_API_KEY = '751945'; // TheSportsDB API key
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

const LOCALSTORAGE_CACHE_KEY = 'sportsdb_cache';
const LOCALSTORAGE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface SportsDbEvent {
  idEvent: string;
  strEvent: string;
  strThumb: string | null;
  strPoster: string | null;
  strBanner: string | null;
  strFanart: string | null;
  strSquare: string | null;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
}

interface SportsDbTeam {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string | null;
  strTeamJersey: string | null;
  strTeamLogo: string | null;
  strTeamFanart1: string | null;
  strTeamBanner: string | null;
}

interface EventSearchResponse {
  event: SportsDbEvent[] | null;
}

interface TeamSearchResponse {
  teams: SportsDbTeam[] | null;
}

interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
}

interface LocalStorageCache {
  events: Record<string, CacheEntry<SportsDbEvent>>;
  teams: Record<string, CacheEntry<SportsDbTeam>>;
}

// In-memory cache for current session (faster access)
const eventCache = new Map<string, CacheEntry<SportsDbEvent>>();
const teamCache = new Map<string, CacheEntry<SportsDbTeam>>();
const MEMORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting - 30 requests per minute for free tier
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_MINUTE = 25; // Leave some buffer

// Load cache from localStorage on init
const loadLocalStorageCache = (): LocalStorageCache => {
  try {
    const cached = localStorage.getItem(LOCALSTORAGE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as LocalStorageCache;
      // Clean expired entries
      const now = Date.now();
      Object.keys(parsed.events).forEach(key => {
        if (now - parsed.events[key].timestamp > LOCALSTORAGE_CACHE_DURATION) {
          delete parsed.events[key];
        }
      });
      Object.keys(parsed.teams).forEach(key => {
        if (now - parsed.teams[key].timestamp > LOCALSTORAGE_CACHE_DURATION) {
          delete parsed.teams[key];
        }
      });
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load SportsDB cache from localStorage');
  }
  return { events: {}, teams: {} };
};

// Save cache to localStorage
const saveToLocalStorage = (key: string, type: 'event' | 'team', data: SportsDbEvent | SportsDbTeam | null) => {
  try {
    const cache = loadLocalStorageCache();
    const entry: CacheEntry<any> = { data, timestamp: Date.now() };
    
    if (type === 'event') {
      cache.events[key] = entry;
    } else {
      cache.teams[key] = entry;
    }
    
    // Limit cache size to prevent localStorage overflow
    const maxEntries = 500;
    if (Object.keys(cache.events).length > maxEntries) {
      const sortedKeys = Object.keys(cache.events).sort((a, b) => 
        cache.events[a].timestamp - cache.events[b].timestamp
      );
      sortedKeys.slice(0, 100).forEach(k => delete cache.events[k]);
    }
    if (Object.keys(cache.teams).length > maxEntries) {
      const sortedKeys = Object.keys(cache.teams).sort((a, b) => 
        cache.teams[a].timestamp - cache.teams[b].timestamp
      );
      sortedKeys.slice(0, 100).forEach(k => delete cache.teams[k]);
    }
    
    localStorage.setItem(LOCALSTORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save SportsDB cache to localStorage');
  }
};

// Get from localStorage cache
const getFromLocalStorage = <T>(key: string, type: 'event' | 'team'): CacheEntry<T> | null => {
  try {
    const cache = loadLocalStorageCache();
    const entry = type === 'event' ? cache.events[key] : cache.teams[key];
    
    if (entry && Date.now() - entry.timestamp < LOCALSTORAGE_CACHE_DURATION) {
      return entry as CacheEntry<T>;
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
};

const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastResetTime >= 60000) {
    requestCount = 0;
    lastResetTime = now;
  }
  return requestCount < MAX_REQUESTS_PER_MINUTE;
};

const incrementRequestCount = () => {
  requestCount++;
};

// Normalize team name for better matching across sports
const normalizeTeamName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+fc$/i, '')
    .replace(/^fc\s+/i, '')
    .replace(/\s+sc$/i, '')
    .replace(/\s+cf$/i, '')
    .replace(/\./g, '')
    .trim();
};

// Format team name for US sports (NBA, NFL, NHL, MLB)
const formatUSTeamName = (name: string): string => {
  const teamMappings: Record<string, string> = {
    'minnesota wild': 'Minnesota Wild',
    'seattle kraken': 'Seattle Kraken',
    'detroit red wings': 'Detroit Red Wings',
    'vancouver canucks': 'Vancouver Canucks',
    'buffalo sabres': 'Buffalo Sabres',
    'calgary flames': 'Calgary Flames',
    'toronto maple leafs': 'Toronto Maple Leafs',
    'boston bruins': 'Boston Bruins',
    'new york rangers': 'New York Rangers',
    'chicago blackhawks': 'Chicago Blackhawks',
    'los angeles lakers': 'Los Angeles Lakers',
    'golden state warriors': 'Golden State Warriors',
    'boston celtics': 'Boston Celtics',
    'miami heat': 'Miami Heat',
    'chicago bulls': 'Chicago Bulls',
    'kansas city chiefs': 'Kansas City Chiefs',
    'san francisco 49ers': 'San Francisco 49ers',
    'dallas cowboys': 'Dallas Cowboys',
    'new england patriots': 'New England Patriots',
  };
  
  const normalized = name.toLowerCase().trim();
  return teamMappings[normalized] || name;
};

// Search for event by home and away team names
export const searchEvent = async (
  homeTeam: string,
  awayTeam: string,
  sport?: string
): Promise<SportsDbEvent | null> => {
  // Skip empty team names
  if (!homeTeam?.trim() || !awayTeam?.trim()) {
    return null;
  }

  const cacheKey = `${normalizeTeamName(homeTeam)}_vs_${normalizeTeamName(awayTeam)}`;
  
  // Check memory cache first (fastest)
  const memoryCached = eventCache.get(cacheKey);
  if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_DURATION) {
    return memoryCached.data;
  }

  // Check localStorage cache (persistent)
  const localCached = getFromLocalStorage<SportsDbEvent>(cacheKey, 'event');
  if (localCached) {
    // Update memory cache
    eventCache.set(cacheKey, localCached);
    return localCached.data;
  }

  if (!checkRateLimit()) {
    console.log('SportsDB rate limit reached, skipping request');
    return null;
  }

  try {
    const searchVariations = [
      `${homeTeam.replace(/\s+/g, '_')}_vs_${awayTeam.replace(/\s+/g, '_')}`,
      `${homeTeam.replace(/\s+/g, '_')}_@_${awayTeam.replace(/\s+/g, '_')}`,
      `${formatUSTeamName(homeTeam).replace(/\s+/g, '_')}_vs_${formatUSTeamName(awayTeam).replace(/\s+/g, '_')}`,
    ];
    
    for (const searchQuery of searchVariations) {
      const url = `${SPORTS_DB_BASE_URL}/${SPORTS_DB_API_KEY}/searchevents.php?e=${encodeURIComponent(searchQuery)}`;
      
      incrementRequestCount();
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('SportsDB API rate limit hit');
          return null;
        }
        continue;
      }

      const data: EventSearchResponse = await response.json();
      const event = data.event?.[0] || null;
      
      if (event) {
        // Cache the result in both memory and localStorage
        const entry = { data: event, timestamp: Date.now() };
        eventCache.set(cacheKey, entry);
        saveToLocalStorage(cacheKey, 'event', event);
        return event;
      }
    }
    
    // No results found, cache null to avoid repeated requests
    const entry = { data: null, timestamp: Date.now() };
    eventCache.set(cacheKey, entry);
    saveToLocalStorage(cacheKey, 'event', null);
    return null;
  } catch (error) {
    console.error('Error fetching event from SportsDB:', error);
    return null;
  }
};

// Search for team by name
export const searchTeam = async (teamName: string): Promise<SportsDbTeam | null> => {
  // Skip empty team names
  if (!teamName?.trim()) {
    return null;
  }

  const cacheKey = normalizeTeamName(teamName);
  
  // Check memory cache first
  const memoryCached = teamCache.get(cacheKey);
  if (memoryCached && Date.now() - memoryCached.timestamp < MEMORY_CACHE_DURATION) {
    return memoryCached.data;
  }

  // Check localStorage cache
  const localCached = getFromLocalStorage<SportsDbTeam>(cacheKey, 'team');
  if (localCached) {
    teamCache.set(cacheKey, localCached);
    return localCached.data;
  }

  if (!checkRateLimit()) {
    console.log('SportsDB rate limit reached, skipping request');
    return null;
  }

  try {
    const url = `${SPORTS_DB_BASE_URL}/${SPORTS_DB_API_KEY}/searchteams.php?t=${encodeURIComponent(teamName)}`;
    
    incrementRequestCount();
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('SportsDB API rate limit hit');
      }
      return null;
    }

    const data: TeamSearchResponse = await response.json();
    const team = data.teams?.[0] || null;
    
    // Cache the result
    const entry = { data: team, timestamp: Date.now() };
    teamCache.set(cacheKey, entry);
    saveToLocalStorage(cacheKey, 'team', team);
    
    return team;
  } catch (error) {
    console.error('Error fetching team from SportsDB:', error);
    return null;
  }
};

// Get the best available image for an event
export const getEventPoster = (event: SportsDbEvent | null, size: 'medium' | 'small' | 'tiny' = 'medium'): string | null => {
  if (!event) return null;
  
  const imageUrl = event.strThumb || event.strBanner || event.strFanart || event.strPoster || event.strSquare;
  
  if (!imageUrl) return null;
  
  return `${imageUrl}/${size}`;
};

// Get team badge from SportsDB
export const getTeamBadge = (team: SportsDbTeam | null): string | null => {
  if (!team) return null;
  return team.strTeamBadge || team.strTeamLogo || null;
};

// Batch fetch posters for multiple matches (with rate limiting)
export const fetchPostersForMatches = async (
  matches: Array<{ homeTeam: string; awayTeam: string; id: string }>
): Promise<Map<string, string>> => {
  const posterMap = new Map<string, string>();
  
  // Filter out matches with empty team names
  const validMatches = matches.filter(m => m.homeTeam?.trim() && m.awayTeam?.trim());
  
  const batchSize = 5;
  for (let i = 0; i < validMatches.length && checkRateLimit(); i += batchSize) {
    const batch = validMatches.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(async (match) => {
        const event = await searchEvent(match.homeTeam, match.awayTeam);
        const poster = getEventPoster(event, 'medium');
        return { id: match.id, poster };
      })
    );
    
    results.forEach(({ id, poster }) => {
      if (poster) {
        posterMap.set(id, poster);
      }
    });
    
    if (i + batchSize < validMatches.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return posterMap;
};

// Clear cache (useful for debugging)
export const clearCache = () => {
  eventCache.clear();
  teamCache.clear();
  localStorage.removeItem(LOCALSTORAGE_CACHE_KEY);
};

export const sportsDbService = {
  searchEvent,
  searchTeam,
  getEventPoster,
  getTeamBadge,
  fetchPostersForMatches,
  clearCache,
};
