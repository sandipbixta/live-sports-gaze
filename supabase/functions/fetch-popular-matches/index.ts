import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_V1_BASE = 'https://www.thesportsdb.com/api/v1/json';
const SPORTS_DB_V2_BASE = 'https://www.thesportsdb.com/api/v2/json';
const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1/vip/damitv/channels/';

// Sports endpoints to fetch from
const SPORTS_ENDPOINTS = [
  { sport: 'Soccer', endpoint: 'soccer', icon: '⚽' },
  { sport: 'Basketball', endpoint: 'basketball', icon: '🏀' },
  { sport: 'American Football', endpoint: 'nfl', icon: '🏈' },
  { sport: 'Ice Hockey', endpoint: 'hockey', icon: '🏒' },
  { sport: 'Tennis', endpoint: 'tennis', icon: '🎾' },
  { sport: 'Cricket', endpoint: 'cricket', icon: '🏏' },
  { sport: 'MMA', endpoint: 'mma', icon: '🥊' },
  { sport: 'Baseball', endpoint: 'baseball', icon: '⚾' },
];

// Popular leagues by sport with priority
const POPULAR_LEAGUES: Record<string, { names: string[], priority: number }[]> = {
  'Soccer': [
    { names: ['English Premier League', 'Premier League'], priority: 10 },
    { names: ['La Liga', 'Spanish La Liga'], priority: 10 },
    { names: ['German Bundesliga', 'Bundesliga'], priority: 9 },
    { names: ['Italian Serie A', 'Serie A'], priority: 9 },
    { names: ['French Ligue 1', 'Ligue 1'], priority: 8 },
    { names: ['UEFA Champions League', 'Champions League'], priority: 10 },
    { names: ['UEFA Europa League', 'Europa League'], priority: 8 },
    { names: ['FIFA World Cup', 'World Cup'], priority: 10 },
    { names: ['MLS', 'Major League Soccer'], priority: 6 },
  ],
  'Basketball': [
    { names: ['NBA', 'National Basketball Association'], priority: 10 },
    { names: ['EuroLeague', 'Euroleague Basketball'], priority: 7 },
    { names: ['NCAA', 'NCAA Basketball'], priority: 6 },
  ],
  'American Football': [
    { names: ['NFL', 'National Football League'], priority: 10 },
    { names: ['NCAA', 'College Football'], priority: 7 },
  ],
  'Ice Hockey': [
    { names: ['NHL', 'National Hockey League'], priority: 10 },
    { names: ['KHL', 'Kontinental Hockey League'], priority: 6 },
  ],
  'Tennis': [
    { names: ['ATP Tour', 'ATP'], priority: 9 },
    { names: ['WTA Tour', 'WTA'], priority: 9 },
    { names: ['Australian Open'], priority: 10 },
    { names: ['French Open', 'Roland Garros'], priority: 10 },
    { names: ['Wimbledon'], priority: 10 },
    { names: ['US Open'], priority: 10 },
  ],
  'Cricket': [
    { names: ['IPL', 'Indian Premier League'], priority: 10 },
    { names: ['ICC World Cup', 'Cricket World Cup'], priority: 10 },
    { names: ['The Ashes', 'Ashes'], priority: 9 },
    { names: ['Big Bash League', 'BBL'], priority: 7 },
    { names: ['T20 World Cup'], priority: 9 },
  ],
  'MMA': [
    { names: ['UFC', 'Ultimate Fighting Championship'], priority: 10 },
    { names: ['Bellator', 'Bellator MMA'], priority: 7 },
    { names: ['ONE Championship'], priority: 6 },
  ],
  'Baseball': [
    { names: ['MLB', 'Major League Baseball'], priority: 10 },
    { names: ['World Series'], priority: 10 },
    { names: ['NPB', 'Nippon Professional Baseball'], priority: 6 },
  ],
};

// Default channels by sport/league
const SPORT_CHANNELS: Record<string, string[]> = {
  'Soccer': ['sky sports', 'bein', 'espn', 'nbc', 'usa network', 'peacock', 'paramount', 'cbs'],
  'Basketball': ['nba tv', 'espn', 'tnt', 'nba'],
  'American Football': ['nfl network', 'espn', 'fox', 'cbs', 'nbc', 'nfl'],
  'Ice Hockey': ['espn', 'tnt', 'nhl network', 'nhl'],
  'Tennis': ['tennis channel', 'espn', 'eurosport'],
  'Cricket': ['willow', 'sky sports cricket', 'star sports', 'cricket'],
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
  strTime?: string;
  strTimestamp?: string;
  dateEvent?: string;
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

// Cache for CDN-Live channels
let cdnChannelsCache: { data: CDNLiveChannel[], timestamp: number } | null = null;
const CDN_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function fetchCDNChannels(): Promise<CDNLiveChannel[]> {
  if (cdnChannelsCache && Date.now() - cdnChannelsCache.timestamp < CDN_CACHE_DURATION) {
    console.log('Using cached CDN-Live channels');
    return cdnChannelsCache.data;
  }

  try {
    console.log('Fetching CDN-Live channels...');
    const response = await fetch(CDN_LIVE_API, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const channels: CDNLiveChannel[] = data?.channels || data || [];
      console.log(`Fetched ${channels.length} CDN-Live channels`);
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

function isPopularLeague(sport: string, leagueName: string): { isPopular: boolean; priority: number } {
  const sportLeagues = POPULAR_LEAGUES[sport] || [];
  const normalizedLeague = leagueName.toLowerCase();
  
  for (const league of sportLeagues) {
    for (const name of league.names) {
      if (normalizedLeague.includes(name.toLowerCase()) || name.toLowerCase().includes(normalizedLeague)) {
        return { isPopular: true, priority: league.priority };
      }
    }
  }
  
  return { isPopular: false, priority: 0 };
}

function getSportIcon(sport: string): string {
  const sportConfig = SPORTS_ENDPOINTS.find(s => s.sport === sport);
  return sportConfig?.icon || '🎯';
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
      
      if (normalizedCDN.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedCDN)) {
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
          
          if (normalizedCDN.includes(normalizedTV) || normalizedTV.includes(normalizedCDN) ||
              normalizedTV.split(' ').filter(p => normalizedCDN.includes(p)).length >= 2) {
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
const CACHE_DURATION = 60 * 1000; // 1 minute for fresher data

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check cache first
    if (cache.matches && Date.now() - cache.matches.timestamp < CACHE_DURATION) {
      console.log('Returning cached matches');
      return new Response(
        JSON.stringify({ 
          matches: cache.matches.data,
          liveCount: cache.matches.data.filter(m => m.isLive).length,
          total: cache.matches.data.length,
          fetchedAt: new Date(cache.matches.timestamp).toISOString(),
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' } }
      );
    }

    console.log('Fetching matches from all sports...');
    
    // Fetch CDN-Live channels first
    const cdnChannels = await fetchCDNChannels();
    console.log(`Got ${cdnChannels.length} CDN-Live channels`);
    
    const allMatches: TransformedMatch[] = [];
    const matchIds = new Set<string>();
    const now = new Date();

    // Fetch live matches from all sports in parallel
    console.log('Fetching live matches from all sports...');
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
        console.log(`Got ${liveMatches.length} live ${sport} matches`);
        
        const matches: TransformedMatch[] = [];
        
        for (const match of liveMatches) {
          const { isPopular, priority } = isPopularLeague(sport, match.strLeague);
          
          // Only include popular leagues
          if (!isPopular) continue;
          
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
            sport,
            sportIcon: icon,
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
            priority: priority + 10, // Boost live matches
          });
        }
        
        return matches;
      } catch (error) {
        console.error(`Error fetching ${sport} live matches:`, error);
        return [];
      }
    });
    
    const liveResults = await Promise.all(livePromises);
    liveResults.forEach(matches => allMatches.push(...matches));
    
    console.log(`Total live matches from popular leagues: ${allMatches.length}`);

    // Sort: Live first, then by priority, then by timestamp
    allMatches.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Limit to 20 matches
    const limitedMatches = allMatches.slice(0, 20);
    
    // Fetch TV channels for matches
    console.log('Fetching TV channels for matches...');
    const tvPromises = limitedMatches.map(async (match) => {
      const channels = await fetchTVChannels(match.id, cdnChannels);
      
      if (channels.length > 0) {
        match.channels = channels;
      } else {
        match.channels = getChannelsForSport(match.sport, cdnChannels);
      }
    });
    
    await Promise.all(tvPromises);
    
    const liveCount = limitedMatches.filter(m => m.isLive).length;

    // Cache the result
    cache.matches = { data: limitedMatches, timestamp: Date.now() };
    
    console.log(`Returning ${limitedMatches.length} matches (${liveCount} live)`);
    
    return new Response(
      JSON.stringify({ 
        matches: limitedMatches,
        liveCount,
        total: limitedMatches.length,
        fetchedAt: new Date().toISOString(),
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' } }
    );
  } catch (error) {
    console.error('Error fetching matches:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch matches', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
