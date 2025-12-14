import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_V2_BASE = 'https://www.thesportsdb.com/api/v2/json';
const SPORTS_DB_V1_BASE = 'https://www.thesportsdb.com/api/v1/json';
const WESTREAM_API = 'https://westream.top';

// STRICT TOP-TIER LEAGUES ONLY
const TOP_LEAGUES = [
  // Football/Soccer
  { name: "English Premier League", sport: "Soccer", icon: "⚽", priority: 10 },
  { name: "Spanish La Liga", sport: "Soccer", icon: "⚽", priority: 10 },
  { name: "German Bundesliga", sport: "Soccer", icon: "⚽", priority: 9 },
  { name: "Italian Serie A", sport: "Soccer", icon: "⚽", priority: 9 },
  { name: "French Ligue 1", sport: "Soccer", icon: "⚽", priority: 8 },
  { name: "UEFA Champions League", sport: "Soccer", icon: "⚽", priority: 10 },
  { name: "UEFA Europa League", sport: "Soccer", icon: "⚽", priority: 8 },
  { name: "English FA Cup", sport: "Soccer", icon: "⚽", priority: 7 },
  { name: "English League Cup", sport: "Soccer", icon: "⚽", priority: 7 },
  { name: "Copa del Rey", sport: "Soccer", icon: "⚽", priority: 7 },
  { name: "MLS", sport: "Soccer", icon: "⚽", priority: 6 },
  { name: "Major League Soccer", sport: "Soccer", icon: "⚽", priority: 6 },
  // Basketball
  { name: "NBA", sport: "Basketball", icon: "🏀", priority: 10 },
  // American Football
  { name: "NFL", sport: "American Football", icon: "🏈", priority: 10 },
  // Ice Hockey
  { name: "NHL", sport: "Ice Hockey", icon: "🏒", priority: 10 },
  // Tennis
  { name: "ATP", sport: "Tennis", icon: "🎾", priority: 9 },
  { name: "WTA", sport: "Tennis", icon: "🎾", priority: 9 },
  { name: "Australian Open", sport: "Tennis", icon: "🎾", priority: 10 },
  { name: "French Open", sport: "Tennis", icon: "🎾", priority: 10 },
  { name: "Wimbledon", sport: "Tennis", icon: "🎾", priority: 10 },
  { name: "US Open", sport: "Tennis", icon: "🎾", priority: 10 },
  // MMA
  { name: "UFC", sport: "MMA", icon: "🥊", priority: 10 },
  // Baseball
  { name: "MLB", sport: "Baseball", icon: "⚾", priority: 10 },
];

// Sports endpoints to fetch
const SPORTS_ENDPOINTS = [
  { sport: 'Soccer', endpoint: 'soccer', icon: '⚽' },
  { sport: 'Basketball', endpoint: 'basketball', icon: '🏀' },
  { sport: 'American Football', endpoint: 'nfl', icon: '🏈' },
  { sport: 'Ice Hockey', endpoint: 'hockey', icon: '🏒' },
  { sport: 'Tennis', endpoint: 'tennis', icon: '🎾' },
  { sport: 'MMA', endpoint: 'mma', icon: '🥊' },
  { sport: 'Baseball', endpoint: 'baseball', icon: '⚾' },
];

// WeStream types
interface WeStreamMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  popular: boolean;
  teams?: {
    home?: { name: string; badge?: string };
    away?: { name: string; badge?: string };
  };
  sources: { source: string; id: string }[];
}

interface WeStreamStream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  source: string;
  embedUrl: string;
}

interface StreamChannel {
  id: string;
  name: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface LiveMatch {
  idEvent: string;
  idLeague: string;
  strEvent: string;
  strSport: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strLeague: string;
  strProgress: string | null;
  strStatus: string | null;
  strThumb: string | null;
  strPoster: string | null;
}

interface TransformedMatch {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge: string | null;
  awayTeamBadge: string | null;
  homeScore: string | null;
  awayScore: string | null;
  sport: string;
  sportIcon: string;
  league: string;
  leagueId: string;
  date: string;
  time: string;
  timestamp: string;
  status: string | null;
  progress: string | null;
  poster: string | null;
  isLive: boolean;
  isFinished: boolean;
  channels: StreamChannel[];
  priority: number;
}

// Leagues to exclude (minor/development leagues)
const EXCLUDED_LEAGUES = [
  'nba g league',
  'g league',
  'nba g-league',
  'g-league',
  'ahl',
  'american hockey league',
  'ncaa',
  'college',
  'ncaab',
  'ncaaf',
  'ushl',
  'echl',
];

// Maximum match duration by sport (in hours) - matches "live" longer than this are likely stale
const MAX_MATCH_DURATION: Record<string, number> = {
  'Basketball': 3,
  'Soccer': 2.5,
  'American Football': 4,
  'Ice Hockey': 3,
  'Tennis': 5,
  'MMA': 5,
  'Baseball': 4,
  'default': 3,
};

// STRICT filter - only top leagues
function isTopLeague(leagueName: string): { isTop: boolean; config: typeof TOP_LEAGUES[0] | null } {
  const normalizedLeague = leagueName.toLowerCase().trim();
  
  // Check if league is in excluded list
  for (const excluded of EXCLUDED_LEAGUES) {
    if (normalizedLeague.includes(excluded)) {
      return { isTop: false, config: null };
    }
  }
  
  for (const league of TOP_LEAGUES) {
    const normalizedTop = league.name.toLowerCase();
    if (normalizedLeague.includes(normalizedTop) || normalizedTop.includes(normalizedLeague)) {
      return { isTop: true, config: league };
    }
  }
  
  return { isTop: false, config: null };
}

// Cache for WeStream matches
let weStreamCache: { data: WeStreamMatch[], timestamp: number } | null = null;
const WESTREAM_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all matches from WeStream API
async function fetchWeStreamMatches(): Promise<WeStreamMatch[]> {
  if (weStreamCache && Date.now() - weStreamCache.timestamp < WESTREAM_CACHE_DURATION) {
    console.log('Using cached WeStream matches');
    return weStreamCache.data;
  }

  try {
    const response = await fetch(`${WESTREAM_API}/matches`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const matches: WeStreamMatch[] = Array.isArray(data) ? data : [];
      weStreamCache = { data: matches, timestamp: Date.now() };
      console.log(`Fetched ${matches.length} matches from WeStream`);
      return matches;
    }
  } catch (error) {
    console.error('Error fetching WeStream matches:', error);
  }
  return weStreamCache?.data || [];
}

// Get stream info from WeStream
async function fetchWeStreamStream(source: string, id: string): Promise<WeStreamStream[]> {
  try {
    const response = await fetch(`${WESTREAM_API}/stream/${source}/${id}`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error(`Error fetching stream ${source}/${id}:`, error);
  }
  return [];
}

// Normalize team name for matching - more aggressive normalization
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(fc|sc|cf|afc|united|city|club|the|de|la|los|las|el|real|sporting|athletic|atletico|inter|ac|as|ss|us|fk|sk|bk|if|gk)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract key words from team name for fuzzy matching
function getTeamKeywords(name: string): string[] {
  const normalized = normalizeTeamName(name);
  return normalized.split(' ').filter(word => word.length >= 3);
}

// Find matching WeStream match by team names - improved fuzzy matching
function findWeStreamMatch(homeTeam: string, awayTeam: string, weStreamMatches: WeStreamMatch[]): WeStreamMatch | null {
  const homeKeywords = getTeamKeywords(homeTeam);
  const awayKeywords = getTeamKeywords(awayTeam);
  
  let bestMatch: WeStreamMatch | null = null;
  let bestScore = 0;
  
  for (const match of weStreamMatches) {
    let score = 0;
    
    // Check teams object
    const wsHome = match.teams?.home?.name || '';
    const wsAway = match.teams?.away?.name || '';
    const wsHomeKeywords = getTeamKeywords(wsHome);
    const wsAwayKeywords = getTeamKeywords(wsAway);
    
    // Check keyword matches in teams
    for (const keyword of homeKeywords) {
      if (wsHomeKeywords.some(wk => wk.includes(keyword) || keyword.includes(wk))) score += 2;
      if (wsAwayKeywords.some(wk => wk.includes(keyword) || keyword.includes(wk))) score += 1;
    }
    for (const keyword of awayKeywords) {
      if (wsAwayKeywords.some(wk => wk.includes(keyword) || keyword.includes(wk))) score += 2;
      if (wsHomeKeywords.some(wk => wk.includes(keyword) || keyword.includes(wk))) score += 1;
    }
    
    // Also check match title
    const titleKeywords = getTeamKeywords(match.title || '');
    for (const keyword of homeKeywords) {
      if (titleKeywords.some(tk => tk.includes(keyword) || keyword.includes(tk))) score += 1;
    }
    for (const keyword of awayKeywords) {
      if (titleKeywords.some(tk => tk.includes(keyword) || keyword.includes(tk))) score += 1;
    }
    
    // Require minimum score to consider it a match
    if (score > bestScore && score >= 3) {
      bestScore = score;
      bestMatch = match;
    }
  }
  
  if (bestMatch) {
    console.log(`Found WeStream match for "${homeTeam} vs ${awayTeam}" -> "${bestMatch.title}" (score: ${bestScore})`);
  }
  
  return bestMatch;
}

// Get stream channels from WeStream match - create embed URLs directly
async function getWeStreamChannels(weStreamMatch: WeStreamMatch): Promise<StreamChannel[]> {
  const channels: StreamChannel[] = [];
  const WESTREAM_EMBED = 'https://westream.su/embed';
  
  if (!weStreamMatch.sources || weStreamMatch.sources.length === 0) {
    console.log(`No sources for match: ${weStreamMatch.title}`);
    return channels;
  }
  
  console.log(`Getting streams for ${weStreamMatch.title} with ${weStreamMatch.sources.length} sources`);
  
  // Create embed URLs directly from sources (more reliable than fetching stream details)
  for (const source of weStreamMatch.sources.slice(0, 5)) {
    // Add primary stream
    channels.push({
      id: `${source.source}-${source.id}`,
      name: `English HD #${channels.length + 1}`,
      country: 'English',
      logo: '',
      embedUrl: `${WESTREAM_EMBED}/${source.source}/${source.id}/1`,
    });
    
    // Add secondary stream for variety
    if (channels.length < 3) {
      channels.push({
        id: `${source.source}-${source.id}-2`,
        name: `English SD #${channels.length + 1}`,
        country: 'English',
        logo: '',
        embedUrl: `${WESTREAM_EMBED}/${source.source}/${source.id}/2`,
      });
    }
  }
  
  console.log(`Created ${channels.length} stream channels for ${weStreamMatch.title}`);
  return channels;
}

// In-memory cache
const cache: { matches?: { data: TransformedMatch[], timestamp: number } } = {};
const CACHE_DURATION = 60 * 1000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check cache
    if (cache.matches && Date.now() - cache.matches.timestamp < CACHE_DURATION) {
      console.log('Returning cached matches');
      return new Response(
        JSON.stringify({ 
          matches: cache.matches.data,
          liveCount: cache.matches.data.filter(m => m.isLive).length,
          total: cache.matches.data.length,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching matches from all sports (TOP LEAGUES ONLY)...');
    
    // Fetch WeStream matches first
    const weStreamMatches = await fetchWeStreamMatches();
    console.log(`Got ${weStreamMatches.length} WeStream matches for stream matching`);
    
    const allMatches: TransformedMatch[] = [];
    const matchIds = new Set<string>();
    const now = new Date();

    // Fetch live matches from all sports in parallel
    const livePromises = SPORTS_ENDPOINTS.map(async ({ sport, endpoint, icon }) => {
      try {
        const response = await fetch(`${SPORTS_DB_V2_BASE}/livescore/${endpoint}`, {
          headers: { 'X-API-KEY': SPORTS_DB_API_KEY },
        });
        
        if (!response.ok) {
          console.log(`No live data for ${sport}: ${response.status}`);
          return [];
        }
        
        const data = await response.json();
        const liveMatches: LiveMatch[] = data?.livescore || data?.events || [];
        console.log(`Got ${liveMatches.length} live ${sport} matches, filtering for top leagues...`);
        
        const matches: TransformedMatch[] = [];
        
        for (const match of liveMatches) {
          // STRICT FILTER: Only top leagues
          const { isTop, config } = isTopLeague(match.strLeague);
          
          if (!isTop) {
            continue; // Skip non-top league matches
          }
          
          // Skip finished matches
          const progress = (match.strProgress || '').toUpperCase();
          const status = (match.strStatus || '').toUpperCase();
          const isFinished = progress === 'FT' || progress === 'AOT' || progress === 'AP' ||
                            status === 'FT' || status.includes('FINISHED') || 
                            status.includes('MATCH FINISHED') || status === 'POST';
          
          if (isFinished) {
            continue;
          }
          
          // Check if match has been "live" for too long (stale data)
          const maxDuration = MAX_MATCH_DURATION[config?.sport || sport] || MAX_MATCH_DURATION['default'];
          const matchTimestamp = match.strTimestamp ? new Date(match.strTimestamp) : null;
          if (matchTimestamp) {
            const hoursElapsed = (now.getTime() - matchTimestamp.getTime()) / (1000 * 60 * 60);
            if (hoursElapsed > maxDuration) {
              console.log(`Skipping stale match ${match.strEvent}: ${hoursElapsed.toFixed(1)}h elapsed (max: ${maxDuration}h)`);
              continue;
            }
          }
          
          if (matchIds.has(match.idEvent)) continue;
          matchIds.add(match.idEvent);
          
          matches.push({
            id: match.idEvent,
            title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
            homeTeam: match.strHomeTeam,
            awayTeam: match.strAwayTeam,
            homeTeamBadge: match.strHomeTeamBadge,
            awayTeamBadge: match.strAwayTeamBadge,
            homeScore: match.intHomeScore,
            awayScore: match.intAwayScore,
            sport: config?.sport || sport,
            sportIcon: config?.icon || icon,
            league: match.strLeague,
            leagueId: match.idLeague,
            date: now.toISOString().slice(0, 10),
            time: new Date().toTimeString().slice(0, 8),
            timestamp: now.toISOString(),
            status: 'Live',
            progress: match.strProgress || 'LIVE',
            poster: match.strThumb || match.strPoster,
            isLive: true,
            isFinished: false,
            channels: [],
            priority: (config?.priority || 5) + 10,
          });
        }
        
        console.log(`${sport}: ${matches.length} matches passed top league filter`);
        return matches;
      } catch (error) {
        console.error(`Error fetching ${sport} live matches:`, error);
        return [];
      }
    });
    
    const liveResults = await Promise.all(livePromises);
    liveResults.forEach(matches => allMatches.push(...matches));
    
    console.log(`Total live matches from TOP LEAGUES: ${allMatches.length}`);

    // ALWAYS fetch upcoming matches to show alongside live matches
    console.log('Fetching upcoming matches from top leagues...');
    
    // Fetch upcoming events from top leagues
    const upcomingPromises = TOP_LEAGUES.slice(0, 10).map(async (league) => {
        try {
          const response = await fetch(`${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/eventsnextleague.php?id=4328`);
          
          if (!response.ok) return [];
          
          const data = await response.json();
          const events = data?.events || [];
          
          const matches: TransformedMatch[] = [];
          for (const event of events.slice(0, 5)) {
            const { isTop, config } = isTopLeague(event.strLeague || league.name);
            if (!isTop && !league.name.toLowerCase().includes('premier')) continue;
            
            if (matchIds.has(event.idEvent)) continue;
            matchIds.add(event.idEvent);
            
            const eventDate = new Date(`${event.dateEvent}T${event.strTime || '00:00:00'}`);
            
            matches.push({
              id: event.idEvent,
              title: event.strEvent || `${event.strHomeTeam} vs ${event.strAwayTeam}`,
              homeTeam: event.strHomeTeam,
              awayTeam: event.strAwayTeam,
              homeTeamBadge: event.strHomeTeamBadge,
              awayTeamBadge: event.strAwayTeamBadge,
              homeScore: null,
              awayScore: null,
              sport: config?.sport || league.sport,
              sportIcon: config?.icon || league.icon,
              league: event.strLeague || league.name,
              leagueId: event.idLeague,
              date: event.dateEvent,
              time: event.strTime || '00:00:00',
              timestamp: eventDate.toISOString(),
              status: 'Upcoming',
              progress: 'NS',
              poster: event.strThumb || event.strPoster,
              isLive: false,
              isFinished: false,
              channels: [],
              priority: config?.priority || league.priority,
            });
          }
          return matches;
        } catch (error) {
          console.error(`Error fetching upcoming for ${league.name}:`, error);
          return [];
        }
      });
      
      // Also fetch from specific top league IDs
      const topLeagueIds = ['4328', '4335', '4331', '4332', '4334', '4387'];
      const leaguePromises = topLeagueIds.map(async (leagueId) => {
        try {
          const response = await fetch(`${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/eventsnextleague.php?id=${leagueId}`);
          if (!response.ok) return [];
          
          const data = await response.json();
          const events = data?.events || [];
          
          const matches: TransformedMatch[] = [];
          for (const event of events.slice(0, 3)) {
            if (matchIds.has(event.idEvent)) continue;
            matchIds.add(event.idEvent);
            
            const { isTop, config } = isTopLeague(event.strLeague);
            const eventDate = new Date(`${event.dateEvent}T${event.strTime || '00:00:00'}`);
            
            matches.push({
              id: event.idEvent,
              title: event.strEvent || `${event.strHomeTeam} vs ${event.strAwayTeam}`,
              homeTeam: event.strHomeTeam,
              awayTeam: event.strAwayTeam,
              homeTeamBadge: event.strHomeTeamBadge,
              awayTeamBadge: event.strAwayTeamBadge,
              homeScore: null,
              awayScore: null,
              sport: config?.sport || 'Soccer',
              sportIcon: config?.icon || '⚽',
              league: event.strLeague,
              leagueId: event.idLeague,
              date: event.dateEvent,
              time: event.strTime || '00:00:00',
              timestamp: eventDate.toISOString(),
              status: 'Upcoming',
              progress: 'NS',
              poster: event.strThumb || event.strPoster,
              isLive: false,
              isFinished: false,
              channels: [],
              priority: config?.priority || 7,
            });
          }
          return matches;
        } catch (error) {
          console.error(`Error fetching league ${leagueId}:`, error);
          return [];
        }
      });
      
      const [upcomingResults, leagueResults] = await Promise.all([
        Promise.all(upcomingPromises),
        Promise.all(leaguePromises)
      ]);
      
    upcomingResults.forEach(matches => allMatches.push(...matches));
    leagueResults.forEach(matches => allMatches.push(...matches));
    
    console.log(`Fetched ${allMatches.length} total matches (live + upcoming)`);

    // Sort: live first, then by priority, then by timestamp
    allMatches.sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Limit to 20 matches
    const limitedMatches = allMatches.slice(0, 20);
    
    // Match with WeStream and get stream links
    if (limitedMatches.length > 0) {
      console.log('Matching with WeStream for stream links...');
      const streamPromises = limitedMatches.map(async (match) => {
        const weStreamMatch = findWeStreamMatch(match.homeTeam, match.awayTeam, weStreamMatches);
        if (weStreamMatch) {
          match.channels = await getWeStreamChannels(weStreamMatch);
        }
      });
      await Promise.all(streamPromises);
    }
    
    const liveCount = limitedMatches.filter(m => m.isLive).length;
    const upcomingCount = limitedMatches.filter(m => !m.isLive && !m.isFinished).length;
    const matchesWithStreams = limitedMatches.filter(m => m.channels.length > 0).length;

    // Cache result
    cache.matches = { data: limitedMatches, timestamp: Date.now() };
    
    console.log(`Returning ${limitedMatches.length} TOP LEAGUE matches (${liveCount} live, ${upcomingCount} upcoming, ${matchesWithStreams} with streams)`);
    
    return new Response(
      JSON.stringify({ 
        matches: limitedMatches,
        liveCount,
        upcomingCount,
        matchesWithStreams,
        total: limitedMatches.length,
        fetchedAt: new Date().toISOString(),
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching matches:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch matches', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
