const WESTREAM_API = 'https://westream.top';
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/751945';

// ============================================
// TYPES
// ============================================

export interface WeStreamTeam {
  name: string;
  badge?: string;
}

export interface WeStreamSource {
  source: string;
  id: string;
}

export interface WeStreamMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  popular: boolean;
  poster?: string;
  teams?: {
    home?: WeStreamTeam;
    away?: WeStreamTeam;
  };
  sources: WeStreamSource[];
}

// ============================================
// LOGO CACHE (In-Memory + LocalStorage)
// ============================================

const logoCache = new Map<string, string | null>();

const getCachedLogo = (teamName: string): string | null | undefined => {
  const key = teamName.toLowerCase().trim();
  
  if (logoCache.has(key)) {
    return logoCache.get(key);
  }
  
  try {
    const stored = localStorage.getItem(`logo_${key}`);
    if (stored) {
      const { url, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        logoCache.set(key, url);
        return url;
      }
    }
  } catch (e) {
    // Ignore
  }
  
  return undefined;
};

const setCachedLogo = (teamName: string, url: string | null) => {
  const key = teamName.toLowerCase().trim();
  logoCache.set(key, url);
  
  try {
    localStorage.setItem(`logo_${key}`, JSON.stringify({
      url,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore storage errors
  }
};

// ============================================
// FETCH TEAM LOGO FROM THESPORTSDB
// ============================================

export const fetchTeamLogo = async (teamName: string): Promise<string | null> => {
  if (!teamName) return null;
  
  const cached = getCachedLogo(teamName);
  if (cached !== undefined) {
    return cached;
  }
  
  try {
    const response = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (!response.ok) {
      setCachedLogo(teamName, null);
      return null;
    }
    
    const data = await response.json();
    
    if (data.teams && data.teams.length > 0) {
      const team = data.teams[0];
      const badge = team.strBadge || team.strTeamBadge || team.strLogo || null;
      setCachedLogo(teamName, badge);
      return badge;
    }
    
    setCachedLogo(teamName, null);
    return null;
  } catch (error) {
    console.warn(`Failed to fetch logo for ${teamName}:`, error);
    setCachedLogo(teamName, null);
    return null;
  }
};

// ============================================
// FETCH EVENT POSTER FROM THESPORTSDB
// ============================================

export const fetchEventPoster = async (
  homeTeam: string, 
  awayTeam: string
): Promise<string | null> => {
  if (!homeTeam || !awayTeam) return null;
  
  const cacheKey = `${homeTeam}_vs_${awayTeam}`;
  const cached = getCachedLogo(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  try {
    const eventName = `${homeTeam} vs ${awayTeam}`;
    const response = await fetch(
      `${SPORTSDB_API}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.event && data.event.length > 0) {
        const event = data.event[0];
        const poster = event.strThumb || event.strPoster || event.strBanner || null;
        setCachedLogo(cacheKey, poster);
        return poster;
      }
    }
    
    setCachedLogo(cacheKey, null);
    return null;
  } catch (error) {
    setCachedLogo(cacheKey, null);
    return null;
  }
};

export interface WeStreamStream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  source: string;
  embedUrl: string;
}

export interface Sport {
  id: string;
  name: string;
}

// ============================================
// API FUNCTIONS
// ============================================

const fetchApi = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${WESTREAM_API}${endpoint}`, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.warn(`WeStream API error: ${response.status} for ${endpoint}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
};

// Get all matches
export const getAllMatches = async (): Promise<WeStreamMatch[]> => {
  const data = await fetchApi<WeStreamMatch[]>('/matches');
  return data || [];
};

// Get live matches
export const getLiveMatches = async (): Promise<WeStreamMatch[]> => {
  const data = await fetchApi<WeStreamMatch[]>('/matches/live');
  return Array.isArray(data) ? data : data ? [data] : [];
};

// Get matches by sport
export const getMatchesBySport = async (sport: string): Promise<WeStreamMatch[]> => {
  const data = await fetchApi<WeStreamMatch[]>(`/matches/${sport}`);
  return data || [];
};

// Get all sports categories
export const getSports = async (): Promise<Sport[]> => {
  const data = await fetchApi<Sport[]>('/sports');
  return data || [];
};

// Get stream info
export const getStreamInfo = async (source: string, id: string): Promise<WeStreamStream[]> => {
  const data = await fetchApi<WeStreamStream[]>(`/stream/${source}/${id}`);
  return data || [];
};

// ============================================
// POPULAR MATCHES
// ============================================

// Get popular matches (filtered by popular: true)
export const getPopularMatches = async (): Promise<WeStreamMatch[]> => {
  const allMatches = await getAllMatches();
  return allMatches.filter(match => match.popular === true);
};

// Get popular live matches
export const getPopularLiveMatches = async (): Promise<WeStreamMatch[]> => {
  const liveMatches = await getLiveMatches();
  return liveMatches.filter(match => match.popular === true);
};

// Get featured matches for carousel/popular section
export const getFeaturedMatches = async (limit: number = 12): Promise<WeStreamMatch[]> => {
  const allMatches = await getAllMatches();
  
  // Separate live and upcoming
  const now = Date.now();
  const liveMatches: WeStreamMatch[] = [];
  const upcomingMatches: WeStreamMatch[] = [];
  
  allMatches.forEach(match => {
    // Match is "live" if started within last 3 hours
    const threeHoursAgo = now - (3 * 60 * 60 * 1000);
    if (match.date <= now && match.date > threeHoursAgo) {
      liveMatches.push(match);
    } else if (match.date > now) {
      upcomingMatches.push(match);
    }
  });
  
  // Sort: Popular first, then by date
  const sortByPopularAndDate = (a: WeStreamMatch, b: WeStreamMatch) => {
    // Popular matches first
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    // Then by date (sooner first)
    return a.date - b.date;
  };
  
  liveMatches.sort(sortByPopularAndDate);
  upcomingMatches.sort(sortByPopularAndDate);
  
  // Combine: Live popular first, then upcoming popular
  const featured = [
    ...liveMatches.filter(m => m.popular),
    ...liveMatches.filter(m => !m.popular),
    ...upcomingMatches.filter(m => m.popular),
    ...upcomingMatches.filter(m => !m.popular),
  ];
  
  return featured.slice(0, limit);
};

// ============================================
// HELPERS
// ============================================

// Check if match is currently live
export const isMatchLive = (match: WeStreamMatch): boolean => {
  const now = Date.now();
  const threeHoursAgo = now - (3 * 60 * 60 * 1000);
  return match.date <= now && match.date > threeHoursAgo;
};

// Get embed URL for a stream
export const getEmbedUrl = (source: string, id: string, streamNo: number = 1): string => {
  return `${WESTREAM_API}/embed/${source}/${id}/${streamNo}`;
};

// Format match date/time
export const formatMatchTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise show date
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
