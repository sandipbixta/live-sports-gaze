const CDN_API = 'https://api.cdn-live.tv/api/v1/vip/damitv';
const WESTREAM_API = 'https://westream.top';
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/751945';

// ============================================
// TYPES
// ============================================

export interface CombinedMatch {
  id: string;
  title: string;
  sport: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeBadge: string | null;
  awayBadge: string | null;
  poster: string | null;
  date: Date;
  isLive: boolean;
  score?: { home: number | string; away: number | string };
  source: 'cdn' | 'westream';
  streamUrl?: string;
  sources?: any[];
}

// ============================================
// LOGO CACHE
// ============================================

const logoCache: Record<string, string | null> = {};
const posterCache: Record<string, string | null> = {};

// Load cache from localStorage
try {
  const stored = localStorage.getItem('logoCache_v2');
  if (stored) Object.assign(logoCache, JSON.parse(stored));
} catch {}

const saveLogoCache = () => {
  try {
    const entries = Object.entries(logoCache).slice(-200); // Keep last 200
    localStorage.setItem('logoCache_v2', JSON.stringify(Object.fromEntries(entries)));
  } catch {}
};

// ============================================
// FETCH TEAM LOGO FROM THESPORTSDB
// ============================================

export const fetchTeamLogo = async (teamName: string): Promise<string | null> => {
  if (!teamName || teamName === 'TBD') return null;
  
  const key = teamName.toLowerCase().trim();
  if (logoCache[key] !== undefined) return logoCache[key];
  
  try {
    const res = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const badge = data.teams?.[0]?.strBadge || data.teams?.[0]?.strTeamBadge || null;
    logoCache[key] = badge;
    saveLogoCache();
    return badge;
  } catch {
    logoCache[key] = null;
    return null;
  }
};

// ============================================
// FETCH EVENT POSTER FROM THESPORTSDB
// ============================================

export const fetchEventPoster = async (homeTeam: string, awayTeam: string): Promise<string | null> => {
  if (!homeTeam || !awayTeam) return null;
  
  const key = `${homeTeam}_vs_${awayTeam}`.toLowerCase();
  if (posterCache[key] !== undefined) return posterCache[key];
  
  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
    const res = await fetch(
      `${SPORTSDB_API}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    const poster = data.event?.[0]?.strThumb || data.event?.[0]?.strPoster || null;
    posterCache[key] = poster;
    return poster;
  } catch {
    posterCache[key] = null;
    return null;
  }
};

// ============================================
// FETCH FROM CDN-LIVE
// ============================================

export const fetchCDNEvents = async (sport?: string): Promise<CombinedMatch[]> => {
  try {
    const endpoint = sport && sport !== 'all' ? `/events/${sport}/` : '/events/sports/';
    const res = await fetch(`${CDN_API}${endpoint}`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    const events = data.events || data.matches || data || [];
    
    if (!Array.isArray(events)) return [];
    
    return events.map((e: any) => {
      // Parse teams from title if not provided
      let homeTeam = e.home_team || e.homeTeam || e.team1 || '';
      let awayTeam = e.away_team || e.awayTeam || e.team2 || '';
      
      if (!homeTeam && !awayTeam && e.title) {
        const parts = e.title.split(/\s+vs\.?\s+|\s+-\s+/i);
        if (parts.length >= 2) {
          homeTeam = parts[0].trim();
          awayTeam = parts[1].trim();
        }
      }
      
      return {
        id: `cdn-${e.id || Math.random().toString(36).substr(2, 9)}`,
        title: e.title || `${homeTeam} vs ${awayTeam}`,
        sport: e.sport || e.category || sport || 'sports',
        competition: e.competition || e.league || '',
        homeTeam,
        awayTeam,
        homeBadge: e.home_badge || null,
        awayBadge: e.away_badge || null,
        poster: e.poster || e.image || null,
        date: new Date(e.start_time || e.date || Date.now()),
        isLive: e.is_live || e.live || e.status === 'live' || e.status === 'LIVE',
        score: e.score || undefined,
        source: 'cdn' as const,
        streamUrl: e.stream_url || e.url,
        sources: e.sources || e.channels || [],
      };
    });
  } catch (err) {
    console.error('CDN fetch error:', err);
    return [];
  }
};

// ============================================
// FETCH FROM WESTREAM
// ============================================

export const fetchWeStreamMatches = async (): Promise<CombinedMatch[]> => {
  try {
    const res = await fetch(`${WESTREAM_API}/matches`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    const matches = Array.isArray(data) ? data : data.matches || [];
    
    return matches.map((m: any) => {
      const now = Date.now();
      const matchDate = m.date || now;
      const threeHoursAgo = now - 3 * 60 * 60 * 1000;
      
      return {
        id: `ws-${m.id}`,
        title: m.title || '',
        sport: m.category?.toLowerCase() || 'sports',
        competition: m.league || m.category || '',
        homeTeam: m.teams?.home?.name || '',
        awayTeam: m.teams?.away?.name || '',
        homeBadge: m.teams?.home?.badge || null,
        awayBadge: m.teams?.away?.badge || null,
        poster: null,
        date: new Date(matchDate),
        isLive: matchDate <= now && matchDate > threeHoursAgo,
        source: 'westream' as const,
        sources: m.sources || [],
      };
    });
  } catch (err) {
    console.error('WeStream fetch error:', err);
    return [];
  }
};

// ============================================
// GET ALL MATCHES (COMBINED)
// ============================================

export const getAllMatches = async (): Promise<CombinedMatch[]> => {
  const [cdnMatches, wsMatches] = await Promise.all([
    fetchCDNEvents(),
    fetchWeStreamMatches(),
  ]);
  
  // Combine and deduplicate by title similarity
  const all = [...cdnMatches];
  const titles = new Set(cdnMatches.map(m => m.title.toLowerCase().replace(/[^a-z0-9]/g, '')));
  
  wsMatches.forEach(m => {
    const normalizedTitle = m.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!titles.has(normalizedTitle)) {
      all.push(m);
      titles.add(normalizedTitle);
    }
  });
  
  // Sort: Live first, then by date
  return all.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return a.date.getTime() - b.date.getTime();
  });
};

// ============================================
// GET LIVE MATCHES ONLY
// ============================================

export const getLiveMatches = async (): Promise<CombinedMatch[]> => {
  const all = await getAllMatches();
  return all.filter(m => m.isLive);
};

// ============================================
// GET MATCHES BY SPORT
// ============================================

export const getMatchesBySport = async (sport: string): Promise<CombinedMatch[]> => {
  const all = await getAllMatches();
  if (sport === 'all') return all;
  
  const sportLower = sport.toLowerCase();
  return all.filter(m => {
    const matchSport = m.sport.toLowerCase();
    // Handle sport aliases
    if (sportLower === 'football' || sportLower === 'soccer') {
      return matchSport.includes('football') || matchSport.includes('soccer');
    }
    if (sportLower === 'basketball' || sportLower === 'nba') {
      return matchSport.includes('basketball') || matchSport.includes('nba');
    }
    if (sportLower === 'hockey' || sportLower === 'nhl') {
      return matchSport.includes('hockey') || matchSport.includes('nhl');
    }
    if (sportLower === 'mma' || sportLower === 'ufc') {
      return matchSport.includes('mma') || matchSport.includes('ufc') || matchSport.includes('boxing');
    }
    return matchSport.includes(sportLower);
  });
};

// ============================================
// SPORT CATEGORIES
// ============================================

export const SPORTS = [
  { id: 'all', name: 'All Sports', icon: '🏆' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'nfl', name: 'NFL', icon: '🏈' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' },
  { id: 'mma', name: 'MMA/UFC', icon: '🥊' },
  { id: 'baseball', name: 'Baseball', icon: '⚾' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
];

export const SPORT_ICONS: Record<string, string> = {
  football: '⚽', soccer: '⚽', basketball: '🏀', nba: '🏀',
  cricket: '🏏', tennis: '🎾', nfl: '🏈', hockey: '🏒', nhl: '🏒',
  mma: '🥊', ufc: '🥊', boxing: '🥊', baseball: '⚾', mlb: '⚾',
  f1: '🏎️', motorsport: '🏎️', formula: '🏎️', rugby: '🏉',
  golf: '⛳', sports: '🏆', default: '🏆'
};

export const getSportIcon = (sport: string): string => {
  const key = sport?.toLowerCase() || 'default';
  return SPORT_ICONS[key] || SPORT_ICONS.default;
};
