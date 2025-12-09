// TheSportsDB API service for fetching match posters and team images
const SPORTS_DB_API_KEY = '123'; // Free tier API key
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

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

// Cache for API responses to avoid hitting rate limits
const eventCache = new Map<string, { data: SportsDbEvent | null; timestamp: number }>();
const teamCache = new Map<string, { data: SportsDbTeam | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting - 30 requests per minute for free tier
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_MINUTE = 25; // Leave some buffer

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
// These sports use city + team name format
const formatUSTeamName = (name: string): string => {
  // Common abbreviations used in streams
  const teamMappings: Record<string, string> = {
    // NHL
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
    // NBA
    'los angeles lakers': 'Los Angeles Lakers',
    'golden state warriors': 'Golden State Warriors',
    'boston celtics': 'Boston Celtics',
    'miami heat': 'Miami Heat',
    'chicago bulls': 'Chicago Bulls',
    // NFL
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
  const cacheKey = `${normalizeTeamName(homeTeam)}_vs_${normalizeTeamName(awayTeam)}`;
  
  // Check cache first
  const cached = eventCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!checkRateLimit()) {
    console.log('SportsDB rate limit reached, skipping request');
    return null;
  }

  try {
    // Try multiple search formats for better matching
    const searchVariations = [
      // Standard format: HomeTeam_vs_AwayTeam
      `${homeTeam.replace(/\s+/g, '_')}_vs_${awayTeam.replace(/\s+/g, '_')}`,
      // US sports format: HomeTeam vs AwayTeam (with @)
      `${homeTeam.replace(/\s+/g, '_')}_@_${awayTeam.replace(/\s+/g, '_')}`,
      // Simplified names
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
        continue; // Try next variation
      }

      const data: EventSearchResponse = await response.json();
      const event = data.event?.[0] || null;
      
      if (event) {
        // Cache the result
        eventCache.set(cacheKey, { data: event, timestamp: Date.now() });
        return event;
      }
    }
    
    // No results found, cache null
    eventCache.set(cacheKey, { data: null, timestamp: Date.now() });
    return null;
  } catch (error) {
    console.error('Error fetching event from SportsDB:', error);
    return null;
  }
};

// Search for team by name
export const searchTeam = async (teamName: string): Promise<SportsDbTeam | null> => {
  const cacheKey = normalizeTeamName(teamName);
  
  // Check cache first
  const cached = teamCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
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
    teamCache.set(cacheKey, { data: team, timestamp: Date.now() });
    
    return team;
  } catch (error) {
    console.error('Error fetching team from SportsDB:', error);
    return null;
  }
};

// Get the best available image for an event (prioritize thumb/banner for 16:9 card layout)
export const getEventPoster = (event: SportsDbEvent | null, size: 'medium' | 'small' | 'tiny' = 'medium'): string | null => {
  if (!event) return null;
  
  // Priority for 16:9 banner layout: thumb > banner > fanart > poster > square
  const imageUrl = event.strThumb || event.strBanner || event.strFanart || event.strPoster || event.strSquare;
  
  if (!imageUrl) return null;
  
  // Append size suffix for optimized loading
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
  
  // Process in batches to respect rate limits
  const batchSize = 5;
  for (let i = 0; i < matches.length && checkRateLimit(); i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    
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
    
    // Small delay between batches
    if (i + batchSize < matches.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return posterMap;
};

export const sportsDbService = {
  searchEvent,
  searchTeam,
  getEventPoster,
  getTeamBadge,
  fetchPostersForMatches,
};
