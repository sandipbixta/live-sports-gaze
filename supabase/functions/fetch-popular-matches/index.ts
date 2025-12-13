import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_V2_BASE = 'https://www.thesportsdb.com/api/v2/json';
const SPORTS_DB_V1_BASE = 'https://www.thesportsdb.com/api/v1/json';
const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1/vip/damitv/channels/';

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

// Default channels by sport
const SPORT_CHANNELS: Record<string, string[]> = {
  'Soccer': ['sky sports', 'bein', 'espn', 'nbc', 'usa network', 'peacock', 'paramount', 'cbs'],
  'Basketball': ['nba tv', 'espn', 'tnt', 'nba'],
  'American Football': ['nfl network', 'espn', 'fox', 'cbs', 'nbc', 'nfl'],
  'Ice Hockey': ['espn', 'tnt', 'nhl network', 'nhl'],
  'Tennis': ['tennis channel', 'espn', 'eurosport'],
  'MMA': ['espn', 'ufc', 'bt sport'],
  'Baseball': ['mlb network', 'espn', 'fox', 'mlb'],
};

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

interface CDNChannel {
  id: string;
  name: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface CDNLiveChannel {
  name: string;
  country: string;
  url: string;
  logo?: string;
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
  channels: CDNChannel[];
  priority: number;
}

// STRICT filter - only top leagues
function isTopLeague(leagueName: string): { isTop: boolean; config: typeof TOP_LEAGUES[0] | null } {
  const normalizedLeague = leagueName.toLowerCase().trim();
  
  for (const league of TOP_LEAGUES) {
    const normalizedTop = league.name.toLowerCase();
    // Check if league name contains the top league name
    if (normalizedLeague.includes(normalizedTop) || normalizedTop.includes(normalizedLeague)) {
      return { isTop: true, config: league };
    }
  }
  
  return { isTop: false, config: null };
}

// Cache for CDN-Live channels
let cdnChannelsCache: { data: CDNLiveChannel[], timestamp: number } | null = null;
const CDN_CACHE_DURATION = 10 * 60 * 1000;

async function fetchCDNChannels(): Promise<CDNLiveChannel[]> {
  if (cdnChannelsCache && Date.now() - cdnChannelsCache.timestamp < CDN_CACHE_DURATION) {
    return cdnChannelsCache.data;
  }

  try {
    const response = await fetch(CDN_LIVE_API, { headers: { 'Accept': 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      const channels: CDNLiveChannel[] = data?.channels || data || [];
      cdnChannelsCache = { data: channels, timestamp: Date.now() };
      return channels;
    }
  } catch (error) {
    console.error('Error fetching CDN-Live channels:', error);
  }
  return cdnChannelsCache?.data || [];
}

function normalizeChannelName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\s]/g, '').trim();
}

function getChannelsForSport(sport: string, cdnChannels: CDNLiveChannel[]): CDNChannel[] {
  const channelKeywords = SPORT_CHANNELS[sport] || ['espn', 'sky sports'];
  const matched: CDNChannel[] = [];
  const seenIds = new Set<string>();
  
  for (const keyword of channelKeywords) {
    const normalizedKeyword = normalizeChannelName(keyword);
    
    for (const cdn of cdnChannels) {
      const normalizedCDN = normalizeChannelName(cdn.name);
      const id = `${cdn.name}-${cdn.country}`.toLowerCase().replace(/\s+/g, '-');
      
      if (seenIds.has(id)) continue;
      
      if (normalizedCDN.includes(normalizedKeyword)) {
        seenIds.add(id);
        matched.push({
          id,
          name: cdn.name,
          country: cdn.country,
          logo: cdn.logo || '',
          embedUrl: cdn.url,
        });
        if (matched.length >= 15) break;
      }
    }
    if (matched.length >= 15) break;
  }
  
  return matched;
}

async function fetchTVChannels(eventId: string, cdnChannels: CDNLiveChannel[]): Promise<CDNChannel[]> {
  try {
    const url = `${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/lookuptv.php?id=${eventId}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      const tvChannels = data?.tvevent || [];
      
      if (tvChannels.length === 0) return [];
      
      const matchedChannels: CDNChannel[] = [];
      const seenIds = new Set<string>();
      
      for (const tv of tvChannels) {
        const normalizedTV = normalizeChannelName(tv.strChannel);
        
        for (const cdn of cdnChannels) {
          const normalizedCDN = normalizeChannelName(cdn.name);
          const id = `${cdn.name}-${cdn.country}`.toLowerCase().replace(/\s+/g, '-');
          
          if (seenIds.has(id)) continue;
          
          if (normalizedCDN.includes(normalizedTV) || normalizedTV.includes(normalizedCDN)) {
            seenIds.add(id);
            matchedChannels.push({
              id,
              name: cdn.name,
              country: cdn.country,
              logo: tv.strLogo || cdn.logo || '',
              embedUrl: cdn.url,
            });
          }
        }
      }
      
      return matchedChannels;
    }
  } catch (error) {
    console.error(`Error fetching TV channels for event ${eventId}:`, error);
  }
  
  return [];
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
    
    const cdnChannels = await fetchCDNChannels();
    console.log(`Got ${cdnChannels.length} CDN-Live channels`);
    
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
          
          // Skip finished matches - they should not appear in "live" section
          const progress = (match.strProgress || '').toUpperCase();
          const status = (match.strStatus || '').toUpperCase();
          const isFinished = progress === 'FT' || progress === 'AOT' || progress === 'AP' ||
                            status === 'FT' || status.includes('FINISHED') || 
                            status.includes('MATCH FINISHED') || status === 'POST';
          
          if (isFinished) {
            continue; // Skip finished matches
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
    
    console.log(`Total matches from TOP LEAGUES: ${allMatches.length}`);

    // Sort: by priority then by timestamp
    allMatches.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Limit to 20 matches
    const limitedMatches = allMatches.slice(0, 20);
    
    // Fetch TV channels for matches
    if (limitedMatches.length > 0) {
      console.log('Fetching TV channels for matches...');
      const tvPromises = limitedMatches.map(async (match) => {
        const channels = await fetchTVChannels(match.id, cdnChannels);
        match.channels = channels.length > 0 ? channels : getChannelsForSport(match.sport, cdnChannels);
      });
      await Promise.all(tvPromises);
    }
    
    const liveCount = limitedMatches.filter(m => m.isLive).length;

    // Cache result
    cache.matches = { data: limitedMatches, timestamp: Date.now() };
    
    console.log(`Returning ${limitedMatches.length} TOP LEAGUE matches (${liveCount} live)`);
    
    return new Response(
      JSON.stringify({ 
        matches: limitedMatches,
        liveCount,
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
