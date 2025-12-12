import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = Deno.env.get('THESPORTSDB_API_KEY') || '3';
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1';

// Popular league IDs from TheSportsDB
const POPULAR_LEAGUES = [
  { id: '4328', name: 'English Premier League', sport: 'Soccer' },
  { id: '4335', name: 'La Liga', sport: 'Soccer' },
  { id: '4331', name: 'German Bundesliga', sport: 'Soccer' },
  { id: '4332', name: 'Italian Serie A', sport: 'Soccer' },
  { id: '4334', name: 'French Ligue 1', sport: 'Soccer' },
  { id: '4480', name: 'UEFA Champions League', sport: 'Soccer' },
  { id: '4387', name: 'NBA', sport: 'Basketball' },
  { id: '4391', name: 'NFL', sport: 'American Football' },
  { id: '4380', name: 'NHL', sport: 'Ice Hockey' },
];

interface SportsDbEvent {
  idEvent: string;
  strEvent: string;
  strEventAlternate: string;
  strFilename: string;
  strSport: string;
  strLeague: string;
  strSeason: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strThumb: string | null;
  strPoster: string | null;
  strBanner: string | null;
  strSquare: string | null;
  dateEvent: string;
  strTime: string;
  strTimestamp: string;
  strVenue: string | null;
  strCountry: string | null;
  strStatus: string | null;
  strProgress: string | null;
}

interface TVChannel {
  idChannel: string;
  strChannel: string;
  strLogo: string | null;
  strCountry: string;
  strLanguage: string | null;
  strWebsite: string | null;
}

interface CDNChannel {
  id: string;
  title: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface BroadcastChannel {
  id: string;
  name: string;
  logo: string | null;
  country: string;
  language: string | null;
  cdnChannel: CDNChannel | null;
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
  league: string;
  date: string;
  time: string;
  timestamp: string;
  venue: string | null;
  country: string | null;
  status: string | null;
  progress: string | null;
  poster: string | null;
  banner: string | null;
  isLive: boolean;
  isFinished: boolean;
  channels: BroadcastChannel[];
}

// In-memory cache
const cache: { 
  matches?: { data: TransformedMatch[], timestamp: number },
  cdnChannels?: { data: CDNChannel[], timestamp: number },
  tvChannels?: Map<string, { data: TVChannel[], timestamp: number }>
} = {
  tvChannels: new Map()
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TV_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for TV data (changes less frequently)

// Fetch CDN channels
async function fetchCDNChannels(): Promise<CDNChannel[]> {
  if (cache.cdnChannels && Date.now() - cache.cdnChannels.timestamp < CACHE_DURATION) {
    console.log('Using cached CDN channels');
    return cache.cdnChannels.data;
  }

  try {
    console.log('Fetching CDN channels...');
    const response = await fetch(`${CDN_LIVE_API}/channels/`);
    
    if (!response.ok) {
      console.error('Failed to fetch CDN channels:', response.status);
      return [];
    }
    
    const data = await response.json();
    let channels: any[] = [];
    
    if (Array.isArray(data)) {
      channels = data;
    } else if (data.channels && Array.isArray(data.channels)) {
      channels = data.channels;
    } else if (data.data && Array.isArray(data.data)) {
      channels = data.data;
    }
    
    const transformedChannels: CDNChannel[] = channels.map((ch: any) => ({
      id: ch.id || ch.name || '',
      title: ch.title || ch.name || '',
      country: ch.country || ch.code || 'INT',
      logo: ch.logo || ch.image || '',
      embedUrl: `${CDN_LIVE_API}/channels/player/?name=${encodeURIComponent(ch.title || ch.name)}&code=${ch.country || ch.code || 'INT'}`
    }));
    
    cache.cdnChannels = { data: transformedChannels, timestamp: Date.now() };
    console.log(`Fetched ${transformedChannels.length} CDN channels`);
    
    return transformedChannels;
  } catch (error) {
    console.error('Error fetching CDN channels:', error);
    return [];
  }
}

// Fetch TV broadcast channels for a specific event from TheSportsDB
async function fetchTVChannels(eventId: string): Promise<TVChannel[]> {
  // Check cache
  const cached = cache.tvChannels?.get(eventId);
  if (cached && Date.now() - cached.timestamp < TV_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const primaryUrl = `${SPORTS_DB_BASE_URL}/${SPORTS_DB_API_KEY}/lookuptv.php?id=${eventId}`;
    console.log(`Fetching TV channels for event ${eventId} with key ${SPORTS_DB_API_KEY}`);
    
    let response = await fetch(primaryUrl);
    
    if (!response.ok && response.status === 404 && SPORTS_DB_API_KEY !== '3') {
      const fallbackUrl = `${SPORTS_DB_BASE_URL}/3/lookuptv.php?id=${eventId}`;
      console.log(`Primary TV API key failed with 404, retrying with free key for event ${eventId}`);
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        response = fallbackResponse;
      } else {
        console.error(`Fallback TV API also failed for event ${eventId}: ${fallbackResponse.status}`);
        return [];
      }
    } else if (!response.ok) {
      console.error(`Failed to fetch TV channels for event ${eventId}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const tvChannels: TVChannel[] = data.tvchannel || [];
    
    // Cache the result
    if (!cache.tvChannels) cache.tvChannels = new Map();
    cache.tvChannels.set(eventId, { data: tvChannels, timestamp: Date.now() });
    
    console.log(`Got ${tvChannels.length} TV channels for event ${eventId}`);
    return tvChannels;
  } catch (error) {
    console.error(`Error fetching TV channels for event ${eventId}:`, error);
    return [];
  }
}

// Normalize channel name for matching
function normalizeChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/hd$/, '')
    .replace(/uk$/, '')
    .replace(/us$/, '')
    .trim();
}

// Match TheSportsDB TV channels with CDN channels
function matchTVToCDN(tvChannel: TVChannel, cdnChannels: CDNChannel[]): CDNChannel | null {
  const normalizedTVName = normalizeChannelName(tvChannel.strChannel);
  
  // Try exact match first
  for (const cdn of cdnChannels) {
    const normalizedCDNName = normalizeChannelName(cdn.title);
    if (normalizedTVName === normalizedCDNName) {
      return cdn;
    }
  }
  
  // Try partial match
  for (const cdn of cdnChannels) {
    const normalizedCDNName = normalizeChannelName(cdn.title);
    if (normalizedTVName.includes(normalizedCDNName) || normalizedCDNName.includes(normalizedTVName)) {
      return cdn;
    }
  }
  
  // Try keyword-based matching for common channels
  const keywords = ['sky', 'espn', 'fox', 'bt sport', 'bein', 'dazn', 'tnt', 'nbc', 'cbs', 'paramount'];
  for (const keyword of keywords) {
    if (normalizedTVName.includes(keyword.replace(/\s/g, ''))) {
      for (const cdn of cdnChannels) {
        if (normalizeChannelName(cdn.title).includes(keyword.replace(/\s/g, ''))) {
          return cdn;
        }
      }
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check cache first
    if (cache.matches && Date.now() - cache.matches.timestamp < CACHE_DURATION) {
      console.log('Returning cached popular matches');
      return new Response(
        JSON.stringify({ 
          matches: cache.matches.data,
          total: cache.matches.data.length,
          fetchedAt: new Date(cache.matches.timestamp).toISOString(),
          cached: true
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          } 
        }
      );
    }

    console.log('Fetching popular matches from TheSportsDB...');
    
    // Fetch CDN channels
    const cdnChannels = await fetchCDNChannels();
    
    const allMatches: TransformedMatch[] = [];
    const now = new Date();
    
    // Fetch next events for each popular league
    const fetchPromises = POPULAR_LEAGUES.map(async (league) => {
      try {
        const primaryUrl = `${SPORTS_DB_BASE_URL}/${SPORTS_DB_API_KEY}/eventsnextleague.php?id=${league.id}`;
        console.log(`Fetching from: ${primaryUrl}`);
        
        let response = await fetch(primaryUrl);
        
        if (!response.ok && response.status === 404 && SPORTS_DB_API_KEY !== '3') {
          const fallbackUrl = `${SPORTS_DB_BASE_URL}/3/eventsnextleague.php?id=${league.id}`;
          console.log(`Primary API key failed with 404 for ${league.name}, retrying with free key...`);
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            response = fallbackResponse;
          } else {
            console.error(`Fallback API also failed for league ${league.name}: ${fallbackResponse.status}`);
            return [];
          }
        } else if (!response.ok) {
          console.error(`Failed to fetch league ${league.name}: ${response.status}`);
          return [];
        }
        
        const data = await response.json();
        const events: SportsDbEvent[] = data.events || [];
        
        console.log(`Got ${events.length} events for ${league.name}`);
        
        // Process events and fetch TV channels for each
        const matchPromises = events.slice(0, 5).map(async (event): Promise<TransformedMatch> => {
          const eventDate = new Date(event.strTimestamp || `${event.dateEvent}T${event.strTime || '00:00:00'}`);
          const isFinished = event.strStatus === 'Match Finished' || event.strStatus === 'FT';
          const isLive = !isFinished && 
                        ((event.strProgress && event.strProgress !== 'NS') ||
                        (eventDate <= now && eventDate.getTime() + 3 * 60 * 60 * 1000 > now.getTime()));
          
          // Fetch TV broadcast channels from TheSportsDB
          const tvChannels = await fetchTVChannels(event.idEvent);
          
          // Match TV channels with CDN channels
          const channels: BroadcastChannel[] = tvChannels.map(tv => {
            const cdnMatch = matchTVToCDN(tv, cdnChannels);
            return {
              id: tv.idChannel || tv.strChannel,
              name: tv.strChannel,
              logo: tv.strLogo,
              country: tv.strCountry || '',
              language: tv.strLanguage,
              cdnChannel: cdnMatch
            };
          });
          
          return {
            id: event.idEvent,
            title: event.strEvent || `${event.strHomeTeam} vs ${event.strAwayTeam}`,
            homeTeam: event.strHomeTeam,
            awayTeam: event.strAwayTeam,
            homeTeamBadge: event.strHomeTeamBadge,
            awayTeamBadge: event.strAwayTeamBadge,
            homeScore: event.intHomeScore,
            awayScore: event.intAwayScore,
            sport: event.strSport || league.sport,
            league: event.strLeague || league.name,
            date: event.dateEvent,
            time: event.strTime || '00:00:00',
            timestamp: event.strTimestamp || `${event.dateEvent}T${event.strTime || '00:00:00'}`,
            venue: event.strVenue,
            country: event.strCountry,
            status: event.strStatus,
            progress: event.strProgress,
            poster: event.strThumb || event.strPoster || event.strSquare,
            banner: event.strBanner,
            isLive,
            isFinished,
            channels,
          };
        });
        
        return Promise.all(matchPromises);
      } catch (error) {
        console.error(`Error fetching league ${league.name}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(fetchPromises);
    results.forEach(matches => allMatches.push(...matches));
    
    // Filter out finished matches
    const upcomingMatches = allMatches.filter(match => !match.isFinished);
    
    // Sort by date/time (live matches first, then upcoming)
    upcomingMatches.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Filter to only show matches within next 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filteredMatches = upcomingMatches.filter(match => {
      const matchDate = new Date(match.timestamp);
      return matchDate <= sevenDaysFromNow;
    });
    
    // Limit to 20 matches
    const limitedMatches = filteredMatches.slice(0, 20);
    
    // Cache the result
    cache.matches = { data: limitedMatches, timestamp: Date.now() };
    
    console.log(`Returning ${limitedMatches.length} popular matches with TV channel data`);
    
    return new Response(
      JSON.stringify({ 
        matches: limitedMatches,
        total: limitedMatches.length,
        fetchedAt: new Date().toISOString(),
        cached: false
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching popular matches:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch popular matches', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
