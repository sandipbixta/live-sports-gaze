import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '3'; // Free tier API key
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';
const CDN_LIVE_API = 'https://api.cdn-live.tv/api/v1';

// Popular league IDs from TheSportsDB
const POPULAR_LEAGUES = [
  { id: '4328', name: 'English Premier League', sport: 'Soccer', channelKeywords: ['sky sports', 'bt sport', 'nbc', 'usa network', 'peacock'] },
  { id: '4335', name: 'La Liga', sport: 'Soccer', channelKeywords: ['espn', 'dazn', 'movistar'] },
  { id: '4331', name: 'German Bundesliga', sport: 'Soccer', channelKeywords: ['sky sports', 'espn'] },
  { id: '4332', name: 'Italian Serie A', sport: 'Soccer', channelKeywords: ['paramount', 'cbs', 'bt sport'] },
  { id: '4334', name: 'French Ligue 1', sport: 'Soccer', channelKeywords: ['bein', 'espn'] },
  { id: '4480', name: 'UEFA Champions League', sport: 'Soccer', channelKeywords: ['paramount', 'cbs', 'bt sport', 'tnt'] },
  { id: '4387', name: 'NBA', sport: 'Basketball', channelKeywords: ['espn', 'tnt', 'nba tv', 'abc'] },
  { id: '4391', name: 'NFL', sport: 'American Football', channelKeywords: ['espn', 'fox', 'cbs', 'nfl network', 'nbc'] },
  { id: '4380', name: 'NHL', sport: 'Ice Hockey', channelKeywords: ['espn', 'tnt', 'nhl network'] },
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

interface CDNChannel {
  id: string;
  title: string;
  country: string;
  logo: string;
  embedUrl: string;
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
  channels: CDNChannel[];
}

// In-memory cache
const cache: { 
  matches?: { data: TransformedMatch[], timestamp: number },
  channels?: { data: CDNChannel[], timestamp: number }
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch CDN channels
async function fetchCDNChannels(): Promise<CDNChannel[]> {
  // Check cache
  if (cache.channels && Date.now() - cache.channels.timestamp < CACHE_DURATION) {
    console.log('Using cached CDN channels');
    return cache.channels.data;
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
    
    // Cache the result
    cache.channels = { data: transformedChannels, timestamp: Date.now() };
    console.log(`Fetched ${transformedChannels.length} CDN channels`);
    
    return transformedChannels;
  } catch (error) {
    console.error('Error fetching CDN channels:', error);
    return [];
  }
}

// Match channels to a match based on sport/league keywords
function matchChannelsToEvent(
  sport: string, 
  league: string, 
  allChannels: CDNChannel[],
  leagueConfig: typeof POPULAR_LEAGUES[0] | undefined
): CDNChannel[] {
  if (!allChannels.length) return [];
  
  const keywords = leagueConfig?.channelKeywords || [];
  const sportKeywords = sport.toLowerCase().split(' ');
  
  // Find channels that match the keywords
  const matchedChannels = allChannels.filter(channel => {
    const channelTitle = channel.title.toLowerCase();
    
    // Check league-specific keywords
    if (keywords.some(kw => channelTitle.includes(kw.toLowerCase()))) {
      return true;
    }
    
    // Check sport-specific keywords
    if (sportKeywords.some(kw => channelTitle.includes(kw))) {
      return true;
    }
    
    // Check for common sports channels
    const sportsChannelKeywords = ['sport', 'espn', 'fox', 'sky', 'bt', 'bein', 'dazn', 'tnt'];
    return sportsChannelKeywords.some(kw => channelTitle.includes(kw));
  });
  
  // Return top 5 matched channels
  return matchedChannels.slice(0, 5);
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    // Fetch CDN channels in parallel
    const [cdnChannels] = await Promise.all([
      fetchCDNChannels()
    ]);
    
    const allMatches: TransformedMatch[] = [];
    const now = new Date();
    
    // Fetch next events for each popular league
    const fetchPromises = POPULAR_LEAGUES.map(async (league) => {
      try {
        const url = `${SPORTS_DB_BASE_URL}/${SPORTS_DB_API_KEY}/eventsnextleague.php?id=${league.id}`;
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch league ${league.name}: ${response.status}`);
          return [];
        }
        
        const data = await response.json();
        const events: SportsDbEvent[] = data.events || [];
        
        console.log(`Got ${events.length} events for ${league.name}`);
        
        return events.map((event): TransformedMatch => {
          const eventDate = new Date(event.strTimestamp || `${event.dateEvent}T${event.strTime || '00:00:00'}`);
          const isFinished = event.strStatus === 'Match Finished' || event.strStatus === 'FT';
          const isLive = !isFinished && 
                        ((event.strProgress && event.strProgress !== 'NS') ||
                        (eventDate <= now && eventDate.getTime() + 3 * 60 * 60 * 1000 > now.getTime()));
          
          // Match channels for this event
          const channels = matchChannelsToEvent(
            event.strSport || league.sport,
            event.strLeague || league.name,
            cdnChannels,
            league
          );
          
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
      } catch (error) {
        console.error(`Error fetching league ${league.name}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(fetchPromises);
    results.forEach(matches => allMatches.push(...matches));
    
    // Filter out finished matches
    const upcomingMatches = allMatches.filter(match => !match.isFinished);
    
    // Sort by date/time (upcoming first, then live matches priority)
    upcomingMatches.sort((a, b) => {
      // Live matches first
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
    
    console.log(`Returning ${limitedMatches.length} popular matches`);
    
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
