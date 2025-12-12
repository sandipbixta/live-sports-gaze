// TheSportsDB Image Service
// API Key: 751945

const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/751945';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Sport name mapping to TheSportsDB values
export const SPORT_API_NAMES: Record<string, string> = {
  'football': 'Soccer',
  'soccer': 'Soccer',
  'basketball': 'Basketball',
  'nba': 'Basketball',
  'afl': 'Australian Football',
  'australian football': 'Australian Football',
  'american football': 'American Football',
  'nfl': 'American Football',
  'baseball': 'Baseball',
  'mlb': 'Baseball',
  'billiards': 'Snooker',
  'snooker': 'Snooker',
  'pool': 'Snooker',
  'cricket': 'Cricket',
  'darts': 'Darts',
  'ufc': 'Fighting',
  'mma': 'Fighting',
  'fighting': 'Fighting',
  'boxing': 'Boxing',
  'wwe': 'Wrestling',
  'wrestling': 'Wrestling',
  'golf': 'Golf',
  'hockey': 'Ice Hockey',
  'ice hockey': 'Ice Hockey',
  'nhl': 'Ice Hockey',
  'motorsport': 'Motorsport',
  'motorsports': 'Motorsport',
  'f1': 'Motorsport',
  'formula 1': 'Motorsport',
  'racing': 'Motorsport',
  'rugby': 'Rugby',
  'tennis': 'Tennis',
  'volleyball': 'Volleyball',
  'handball': 'Handball',
  'cycling': 'Cycling',
  'esports': 'ESports',
};

// Sport thumbnail images from TheSportsDB
export const SPORT_THUMBNAILS: Record<string, string> = {
  'Soccer': 'https://www.thesportsdb.com/images/sports/soccer.jpg',
  'Basketball': 'https://www.thesportsdb.com/images/sports/basketball.jpg',
  'Australian Football': 'https://www.thesportsdb.com/images/sports/aussie_rules.jpg',
  'American Football': 'https://www.thesportsdb.com/images/sports/american_football.jpg',
  'Baseball': 'https://www.thesportsdb.com/images/sports/baseball.jpg',
  'Snooker': 'https://www.thesportsdb.com/images/sports/snooker.jpg',
  'Cricket': 'https://www.thesportsdb.com/images/sports/cricket.jpg',
  'Darts': 'https://www.thesportsdb.com/images/sports/darts.jpg',
  'Fighting': 'https://www.thesportsdb.com/images/sports/fighting.jpg',
  'Boxing': 'https://www.thesportsdb.com/images/sports/fighting.jpg',
  'Wrestling': 'https://www.thesportsdb.com/images/sports/fighting.jpg',
  'Golf': 'https://www.thesportsdb.com/images/sports/golf.jpg',
  'Ice Hockey': 'https://www.thesportsdb.com/images/sports/ice_hockey.jpg',
  'Motorsport': 'https://www.thesportsdb.com/images/sports/motorsport.jpg',
  'Rugby': 'https://www.thesportsdb.com/images/sports/rugby.jpg',
  'Tennis': 'https://www.thesportsdb.com/images/sports/tennis.jpg',
  'Volleyball': 'https://www.thesportsdb.com/images/sports/volleyball.jpg',
  'Handball': 'https://www.thesportsdb.com/images/sports/handball.jpg',
  'Cycling': 'https://www.thesportsdb.com/images/sports/cycling.jpg',
  'ESports': 'https://www.thesportsdb.com/images/sports/esports.jpg',
};

// Cache structure
interface CacheEntry {
  value: string | null;
  timestamp: number;
}

// In-memory cache
const imageCache: Record<string, CacheEntry> = {};

// Load cache from localStorage
const loadCache = (): void => {
  try {
    const stored = localStorage.getItem('sportsdb_images_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      // Only load non-expired entries
      Object.entries(parsed).forEach(([key, entry]) => {
        const cacheEntry = entry as CacheEntry;
        if (now - cacheEntry.timestamp < CACHE_DURATION) {
          imageCache[key] = cacheEntry;
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load image cache:', e);
  }
};

// Save cache to localStorage
const saveCache = (): void => {
  try {
    localStorage.setItem('sportsdb_images_v2', JSON.stringify(imageCache));
  } catch (e) {
    console.warn('Failed to save image cache:', e);
  }
};

// Initialize cache
loadCache();

// Get from cache
const getFromCache = (key: string): string | null | undefined => {
  const entry = imageCache[key];
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    delete imageCache[key];
    return undefined;
  }
  return entry.value;
};

// Set to cache
const setToCache = (key: string, value: string | null): void => {
  imageCache[key] = { value, timestamp: Date.now() };
  saveCache();
};

// Normalize team name for searching
const normalizeTeamName = (name: string): string => {
  return name
    .replace(/\s*(FC|SC|CF|AFC|United|City|Utd)\.?\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Fetch team badge
export const getTeamBadge = async (teamName: string): Promise<string | null> => {
  if (!teamName) return null;
  
  const key = `team_${teamName.toLowerCase().trim()}`;
  const cached = getFromCache(key);
  if (cached !== undefined) return cached;
  
  try {
    const res = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    
    let badge = data.teams?.[0]?.strBadge || data.teams?.[0]?.strLogo || null;
    
    // Try normalized name if not found
    if (!badge && teamName !== normalizeTeamName(teamName)) {
      const normalizedRes = await fetch(
        `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(normalizeTeamName(teamName))}`,
        { signal: AbortSignal.timeout(8000) }
      );
      const normalizedData = await normalizedRes.json();
      badge = normalizedData.teams?.[0]?.strBadge || normalizedData.teams?.[0]?.strLogo || null;
    }
    
    setToCache(key, badge);
    return badge;
  } catch (e) {
    console.warn('Failed to fetch team badge:', teamName, e);
    setToCache(key, null);
    return null;
  }
};

// Sync version - only returns cached value
export const getTeamBadgeSync = (teamName: string): string | null => {
  if (!teamName) return null;
  const key = `team_${teamName.toLowerCase().trim()}`;
  const cached = getFromCache(key);
  return cached ?? null;
};

// Fetch league badge
export const getLeagueBadge = async (leagueName: string): Promise<string | null> => {
  if (!leagueName) return null;
  
  const key = `league_${leagueName.toLowerCase().trim()}`;
  const cached = getFromCache(key);
  if (cached !== undefined) return cached;
  
  try {
    const res = await fetch(
      `${SPORTSDB_API}/search_all_leagues.php?l=${encodeURIComponent(leagueName)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    const badge = data.leagues?.[0]?.strBadge || data.leagues?.[0]?.strLogo || null;
    setToCache(key, badge);
    return badge;
  } catch (e) {
    console.warn('Failed to fetch league badge:', leagueName, e);
    setToCache(key, null);
    return null;
  }
};

// Fetch event poster/thumbnail
export const getEventPoster = async (homeTeam: string, awayTeam: string): Promise<string | null> => {
  if (!homeTeam || !awayTeam) return null;
  
  const key = `event_${homeTeam}_${awayTeam}`.toLowerCase().replace(/\s+/g, '_');
  const cached = getFromCache(key);
  if (cached !== undefined) return cached;
  
  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`;
    const res = await fetch(
      `${SPORTSDB_API}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    const poster = data.event?.[0]?.strThumb || data.event?.[0]?.strPoster || data.event?.[0]?.strSquare || null;
    setToCache(key, poster);
    return poster;
  } catch (e) {
    console.warn('Failed to fetch event poster:', homeTeam, 'vs', awayTeam, e);
    setToCache(key, null);
    return null;
  }
};

// Get sport thumbnail image
export const getSportThumbnail = (sport: string): string | null => {
  const apiName = SPORT_API_NAMES[sport.toLowerCase()] || sport;
  return SPORT_THUMBNAILS[apiName] || null;
};

// Get TheSportsDB API sport name
export const getApiSportName = (sport: string): string => {
  return SPORT_API_NAMES[sport.toLowerCase()] || sport;
};

// Sport icon fallback (emoji)
export const getSportIcon = (sport: string): string => {
  const icons: Record<string, string> = {
    'soccer': '⚽',
    'football': '⚽',
    'basketball': '🏀',
    'australian football': '🏉',
    'afl': '🏉',
    'american football': '🏈',
    'nfl': '🏈',
    'baseball': '⚾',
    'mlb': '⚾',
    'snooker': '🎱',
    'billiards': '🎱',
    'pool': '🎱',
    'cricket': '🏏',
    'darts': '🎯',
    'fighting': '🥊',
    'mma': '🥊',
    'ufc': '🥊',
    'boxing': '🥊',
    'wrestling': '🤼',
    'wwe': '🤼',
    'golf': '⛳',
    'ice hockey': '🏒',
    'hockey': '🏒',
    'nhl': '🏒',
    'motorsport': '🏎️',
    'motorsports': '🏎️',
    'f1': '🏎️',
    'racing': '🏎️',
    'rugby': '🏉',
    'tennis': '🎾',
    'volleyball': '🏐',
    'handball': '🤾',
    'cycling': '🚴',
    'esports': '🎮',
    'gaming': '🎮',
  };
  return icons[sport.toLowerCase()] || '🏆';
};

// Fetch all leagues for a sport
export const getLeaguesBySport = async (sport: string): Promise<Array<{
  id: string;
  name: string;
  badge: string | null;
  country: string | null;
}>> => {
  const apiSport = getApiSportName(sport);
  
  try {
    const res = await fetch(
      `${SPORTSDB_API}/search_all_leagues.php?s=${encodeURIComponent(apiSport)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();
    
    return (data.leagues || []).map((league: any) => ({
      id: league.idLeague,
      name: league.strLeague,
      badge: league.strBadge || league.strLogo,
      country: league.strCountry,
    }));
  } catch (e) {
    console.warn('Failed to fetch leagues for sport:', sport, e);
    return [];
  }
};

// Clear cache
export const clearImageCache = (): void => {
  Object.keys(imageCache).forEach(key => delete imageCache[key]);
  localStorage.removeItem('sportsdb_images_v2');
};

// Preload team badges for a list of teams
export const preloadTeamBadges = async (teams: string[]): Promise<void> => {
  const uniqueTeams = [...new Set(teams.filter(Boolean))];
  await Promise.allSettled(uniqueTeams.map(team => getTeamBadge(team)));
};

export default {
  getTeamBadge,
  getTeamBadgeSync,
  getLeagueBadge,
  getEventPoster,
  getSportThumbnail,
  getSportIcon,
  getApiSportName,
  getLeaguesBySport,
  clearImageCache,
  preloadTeamBadges,
  SPORT_API_NAMES,
  SPORT_THUMBNAILS,
};
