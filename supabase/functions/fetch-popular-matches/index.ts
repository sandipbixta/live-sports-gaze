import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_V1_BASE = 'https://www.thesportsdb.com/api/v1/json';
const SPORTS_DB_V2_BASE = 'https://www.thesportsdb.com/api/v2/json';
const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1/vip/damitv/channels/';

// Popular football league IDs from TheSportsDB
const POPULAR_LEAGUES = [
  { id: '4328', name: 'English Premier League', priority: 10 },
  { id: '4335', name: 'La Liga', priority: 10 },
  { id: '4331', name: 'German Bundesliga', priority: 9 },
  { id: '4332', name: 'Italian Serie A', priority: 9 },
  { id: '4334', name: 'French Ligue 1', priority: 8 },
  { id: '4480', name: 'UEFA Champions League', priority: 10 },
  { id: '4481', name: 'UEFA Europa League', priority: 8 },
  { id: '4350', name: 'Mexican Primera League', priority: 8 },
  { id: '4406', name: 'Argentine Primera Division', priority: 8 },
  { id: '4346', name: 'MLS', priority: 6 },
  { id: '4338', name: 'Belgian Pro League', priority: 7 },
  { id: '4344', name: 'Portuguese Primeira Liga', priority: 7 },
  { id: '4337', name: 'Dutch Eredivisie', priority: 7 },
];

interface LiveMatch {
  idEvent: string;
  idLeague: string;
  strEvent: string;
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

interface ScheduledMatch {
  idEvent: string;
  idLeague: string;
  strEvent: string;
  strEventAlternate: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strLeague: string;
  strThumb: string | null;
  strPoster: string | null;
  strSquare: string | null;
  dateEvent: string;
  strTime: string;
  strTimestamp: string;
  strStatus: string | null;
  strProgress: string | null;
}

interface TVChannel {
  strChannel: string;
  strCountry: string;
  strLogo: string | null;
  strTime: string | null;
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

// Fetch CDN-Live channels
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
    } else {
      console.error('Failed to fetch CDN-Live channels:', response.status);
    }
  } catch (error) {
    console.error('Error fetching CDN-Live channels:', error);
  }
  
  return cdnChannelsCache?.data || [];
}

// Normalize channel name for matching
function normalizeChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Match TheSportsDB channel with CDN-Live channel
function matchChannel(tvChannel: TVChannel, cdnChannels: CDNLiveChannel[]): CDNChannel | null {
  const normalizedTVName = normalizeChannelName(tvChannel.strChannel);
  
  // Try exact match first
  for (const cdn of cdnChannels) {
    const normalizedCDNName = normalizeChannelName(cdn.name);
    if (normalizedCDNName === normalizedTVName) {
      return {
        id: `${cdn.name}-${cdn.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: cdn.name,
        country: cdn.country,
        logo: tvChannel.strLogo || cdn.logo || '',
        embedUrl: cdn.url,
      };
    }
  }
  
  // Try partial match (channel name contains TV name or vice versa)
  for (const cdn of cdnChannels) {
    const normalizedCDNName = normalizeChannelName(cdn.name);
    if (normalizedCDNName.includes(normalizedTVName) || normalizedTVName.includes(normalizedCDNName)) {
      return {
        id: `${cdn.name}-${cdn.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: cdn.name,
        country: cdn.country,
        logo: tvChannel.strLogo || cdn.logo || '',
        embedUrl: cdn.url,
      };
    }
  }
  
  // Try matching key parts (e.g., "sky sports" in "sky sports main event")
  const tvParts = normalizedTVName.split(' ');
  for (const cdn of cdnChannels) {
    const normalizedCDNName = normalizeChannelName(cdn.name);
    const cdnParts = normalizedCDNName.split(' ');
    
    // Check if at least 2 words match
    const matchingParts = tvParts.filter(part => 
      cdnParts.some(cdnPart => cdnPart === part || cdnPart.includes(part) || part.includes(cdnPart))
    );
    
    if (matchingParts.length >= 2) {
      return {
        id: `${cdn.name}-${cdn.country}`.toLowerCase().replace(/\s+/g, '-'),
        name: cdn.name,
        country: cdn.country,
        logo: tvChannel.strLogo || cdn.logo || '',
        embedUrl: cdn.url,
      };
    }
  }
  
  return null;
}

// Fetch TV channels for an event from TheSportsDB
async function fetchTVChannels(eventId: string, cdnChannels: CDNLiveChannel[]): Promise<CDNChannel[]> {
  try {
    const url = `${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/lookuptv.php?id=${eventId}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      const tvChannels: TVChannel[] = data?.tvevent || [];
      
      if (tvChannels.length === 0) {
        console.log(`No TV channels found for event ${eventId}`);
        return [];
      }
      
      console.log(`Found ${tvChannels.length} TV channels for event ${eventId}`);
      
      const matchedChannels: CDNChannel[] = [];
      const seenIds = new Set<string>();
      
      for (const tv of tvChannels) {
        const matched = matchChannel(tv, cdnChannels);
        if (matched && !seenIds.has(matched.id)) {
          seenIds.add(matched.id);
          matchedChannels.push(matched);
        }
      }
      
      console.log(`Matched ${matchedChannels.length} channels with CDN-Live for event ${eventId}`);
      return matchedChannels;
    }
  } catch (error) {
    console.error(`Error fetching TV channels for event ${eventId}:`, error);
  }
  
  return [];
}

// Fallback: Get default channels based on league
function getDefaultChannels(leagueName: string, cdnChannels: CDNLiveChannel[]): CDNChannel[] {
  const defaultChannelNames = ['beIN Sports 1', 'ESPN', 'Sky Sports', 'CBS Sports'];
  const channels: CDNChannel[] = [];
  
  for (const channelName of defaultChannelNames) {
    const normalized = normalizeChannelName(channelName);
    for (const cdn of cdnChannels) {
      if (normalizeChannelName(cdn.name).includes(normalized)) {
        channels.push({
          id: `${cdn.name}-${cdn.country}`.toLowerCase().replace(/\s+/g, '-'),
          name: cdn.name,
          country: cdn.country,
          logo: cdn.logo || '',
          embedUrl: cdn.url,
        });
        break;
      }
    }
    if (channels.length >= 3) break;
  }
  
  return channels;
}

// Get priority for a league
function getLeaguePriority(leagueId: string): number {
  const league = POPULAR_LEAGUES.find(l => l.id === leagueId);
  return league?.priority || 5;
}

// Fetch event details to get thumbnail
async function fetchEventPoster(eventId: string): Promise<string | null> {
  try {
    const url = `${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/lookupevent.php?id=${eventId}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const event = data?.events?.[0];
      return event?.strThumb || event?.strPoster || event?.strSquare || null;
    }
  } catch (e) {
    console.log(`Failed to fetch poster for event ${eventId}`);
  }
  return null;
}

// In-memory cache
const cache: { 
  matches?: { data: TransformedMatch[], timestamp: number },
} = {};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for fresher data

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
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          } 
        }
      );
    }

    console.log('Fetching fresh football matches from TheSportsDB...');
    
    // Fetch CDN-Live channels first
    const cdnChannels = await fetchCDNChannels();
    console.log(`Got ${cdnChannels.length} CDN-Live channels for matching`);
    
    const allMatches: TransformedMatch[] = [];
    const matchIds = new Set<string>();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // 1. Fetch LIVE matches using V2 API
    console.log('Fetching live soccer matches from V2 API...');
    try {
      const liveResponse = await fetch(`${SPORTS_DB_V2_BASE}/livescore/soccer`, {
        headers: {
          'X-API-KEY': SPORTS_DB_API_KEY,
        },
      });
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        const liveMatches: LiveMatch[] = liveData?.livescore || liveData?.events || [];
        console.log(`Got ${liveMatches.length} live matches from V2 API`);
        
        for (const match of liveMatches) {
          if (matchIds.has(match.idEvent)) continue;
          matchIds.add(match.idEvent);
          
          const leaguePriority = getLeaguePriority(match.idLeague);
          
          allMatches.push({
            id: match.idEvent,
            title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
            homeTeam: match.strHomeTeam,
            awayTeam: match.strAwayTeam,
            homeTeamBadge: match.strHomeTeamBadge,
            awayTeamBadge: match.strAwayTeamBadge,
            homeScore: match.intHomeScore,
            awayScore: match.intAwayScore,
            league: match.strLeague,
            leagueId: match.idLeague,
            date: today,
            time: new Date().toTimeString().slice(0, 8),
            timestamp: now.toISOString(),
            status: 'Live',
            progress: match.strProgress || 'LIVE',
            poster: match.strThumb || match.strPoster,
            isLive: true,
            isFinished: false,
            channels: [], // Will be populated with TV lookup
            priority: leaguePriority + 10, // Boost live matches
          });
        }
      } else {
        console.error('Failed to fetch live matches:', liveResponse.status);
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    }

    // 2. Fetch today's matches using V1 API
    console.log(`Fetching today's soccer matches (${today}) from V1 API...`);
    try {
      const todayUrl = `${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/eventsday.php?d=${today}&s=Soccer`;
      const todayResponse = await fetch(todayUrl);
      
      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        const todayMatches: ScheduledMatch[] = todayData?.events || [];
        console.log(`Got ${todayMatches.length} matches for today from V1 API`);
        
        for (const match of todayMatches) {
          if (matchIds.has(match.idEvent)) continue;
          matchIds.add(match.idEvent);
          
          const isFinished = match.strStatus === 'Match Finished' || match.strStatus === 'FT';
          if (isFinished) continue;
          
          const leaguePriority = getLeaguePriority(match.idLeague);
          const matchTime = match.strTimestamp || `${match.dateEvent}T${match.strTime || '00:00:00'}`;
          
          allMatches.push({
            id: match.idEvent,
            title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
            homeTeam: match.strHomeTeam,
            awayTeam: match.strAwayTeam,
            homeTeamBadge: match.strHomeTeamBadge,
            awayTeamBadge: match.strAwayTeamBadge,
            homeScore: match.intHomeScore,
            awayScore: match.intAwayScore,
            league: match.strLeague,
            leagueId: match.idLeague,
            date: match.dateEvent,
            time: match.strTime || '00:00:00',
            timestamp: matchTime,
            status: match.strStatus,
            progress: match.strProgress,
            poster: match.strThumb || match.strPoster || match.strSquare,
            isLive: false,
            isFinished: false,
            channels: [], // Will be populated with TV lookup
            priority: leaguePriority,
          });
        }
      } else {
        console.error('Failed to fetch today matches:', todayResponse.status);
      }
    } catch (error) {
      console.error('Error fetching today matches:', error);
    }

    // 3. Fetch upcoming matches from popular leagues using V1 API
    console.log('Fetching upcoming matches from popular leagues...');
    const upcomingPromises = POPULAR_LEAGUES.slice(0, 8).map(async (league) => {
      try {
        const url = `${SPORTS_DB_V1_BASE}/${SPORTS_DB_API_KEY}/eventsnextleague.php?id=${league.id}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch league ${league.name}: ${response.status}`);
          return [];
        }
        
        const data = await response.json();
        const events: ScheduledMatch[] = data?.events || [];
        console.log(`Got ${events.length} upcoming events for ${league.name}`);
        
        const matches: TransformedMatch[] = [];
        
        for (const match of events.slice(0, 5)) {
          if (matchIds.has(match.idEvent)) continue;
          matchIds.add(match.idEvent);
          
          const isFinished = match.strStatus === 'Match Finished' || match.strStatus === 'FT';
          if (isFinished) continue;
          
          const matchTime = match.strTimestamp || `${match.dateEvent}T${match.strTime || '00:00:00'}`;
          
          matches.push({
            id: match.idEvent,
            title: match.strEvent || `${match.strHomeTeam} vs ${match.strAwayTeam}`,
            homeTeam: match.strHomeTeam,
            awayTeam: match.strAwayTeam,
            homeTeamBadge: match.strHomeTeamBadge,
            awayTeamBadge: match.strAwayTeamBadge,
            homeScore: match.intHomeScore,
            awayScore: match.intAwayScore,
            league: match.strLeague || league.name,
            leagueId: match.idLeague || league.id,
            date: match.dateEvent,
            time: match.strTime || '00:00:00',
            timestamp: matchTime,
            status: match.strStatus,
            progress: match.strProgress,
            poster: match.strThumb || match.strPoster || match.strSquare,
            isLive: false,
            isFinished: false,
            channels: [], // Will be populated with TV lookup
            priority: league.priority,
          });
        }
        
        return matches;
      } catch (error) {
        console.error(`Error fetching league ${league.name}:`, error);
        return [];
      }
    });
    
    const upcomingResults = await Promise.all(upcomingPromises);
    upcomingResults.forEach(matches => allMatches.push(...matches));

    // Sort: Live first, then by priority, then by date
    allMatches.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Filter to only show matches within next 7 days and exclude finished
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filteredMatches = allMatches.filter(match => {
      if (match.isFinished) return false;
      const matchDate = new Date(match.timestamp);
      return matchDate <= sevenDaysFromNow;
    });

    // Limit to 30 matches
    const limitedMatches = filteredMatches.slice(0, 30);
    
    // Fetch TV channels for top matches (limit to avoid rate limiting)
    console.log('Fetching TV channels for matches...');
    const tvPromises = limitedMatches.slice(0, 20).map(async (match) => {
      const channels = await fetchTVChannels(match.id, cdnChannels);
      
      // If no TV channels found, use default channels
      if (channels.length === 0) {
        const defaults = getDefaultChannels(match.league, cdnChannels);
        match.channels = defaults;
      } else {
        match.channels = channels;
      }
    });
    
    await Promise.all(tvPromises);
    
    // For remaining matches without channels, add defaults
    for (const match of limitedMatches) {
      if (match.channels.length === 0) {
        match.channels = getDefaultChannels(match.league, cdnChannels);
      }
    }
    
    // Fetch posters for matches that don't have one (batch up to 10 at a time)
    const matchesNeedingPosters = limitedMatches.filter(m => !m.poster).slice(0, 10);
    console.log(`Fetching posters for ${matchesNeedingPosters.length} matches...`);
    
    const posterPromises = matchesNeedingPosters.map(async (match) => {
      const poster = await fetchEventPoster(match.id);
      if (poster) {
        const idx = limitedMatches.findIndex(m => m.id === match.id);
        if (idx !== -1) limitedMatches[idx].poster = poster;
      }
    });
    await Promise.all(posterPromises);
    
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
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching matches:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch matches', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
