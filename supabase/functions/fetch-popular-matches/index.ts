import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_V1_BASE = 'https://www.thesportsdb.com/api/v1/json';
const SPORTS_DB_V2_BASE = 'https://www.thesportsdb.com/api/v2/json';

// Popular football league IDs from TheSportsDB
const POPULAR_LEAGUES = [
  { id: '4328', name: 'English Premier League', priority: 10 },
  { id: '4335', name: 'La Liga', priority: 10 },
  { id: '4331', name: 'German Bundesliga', priority: 9 },
  { id: '4332', name: 'Italian Serie A', priority: 9 },
  { id: '4334', name: 'French Ligue 1', priority: 8 },
  { id: '4480', name: 'UEFA Champions League', priority: 10 },
  { id: '4481', name: 'UEFA Europa League', priority: 8 },
  { id: '4350', name: 'Brazilian Serie A', priority: 8 },
  { id: '4406', name: 'Argentine Primera Division', priority: 8 },
  { id: '4346', name: 'MLS', priority: 6 },
  { id: '4338', name: 'EFL Championship', priority: 7 },
  { id: '4344', name: 'Portuguese Primeira Liga', priority: 7 },
  { id: '4337', name: 'Dutch Eredivisie', priority: 7 },
];

// CDN-Live channel mapping by league
const LEAGUE_CHANNELS: Record<string, Array<{ name: string; country: string; priority: number }>> = {
  'English Premier League': [
    { name: 'Sky Sports Premier League', country: 'UK', priority: 10 },
    { name: 'Sky Sports Main Event', country: 'UK', priority: 9 },
    { name: 'beIN Sports 1', country: 'INT', priority: 8 },
    { name: 'NBC Sports', country: 'US', priority: 7 },
    { name: 'Peacock', country: 'US', priority: 6 },
  ],
  'La Liga': [
    { name: 'beIN Sports 1', country: 'INT', priority: 10 },
    { name: 'ESPN', country: 'US', priority: 9 },
    { name: 'ESPN Deportes', country: 'US', priority: 8 },
  ],
  'UEFA Champions League': [
    { name: 'beIN Sports 1', country: 'INT', priority: 10 },
    { name: 'CBS Sports', country: 'US', priority: 9 },
    { name: 'Paramount+', country: 'US', priority: 8 },
    { name: 'BT Sport 1', country: 'UK', priority: 7 },
  ],
  'UEFA Europa League': [
    { name: 'beIN Sports 2', country: 'INT', priority: 10 },
    { name: 'CBS Sports', country: 'US', priority: 9 },
    { name: 'BT Sport 2', country: 'UK', priority: 8 },
  ],
  'German Bundesliga': [
    { name: 'Sky Sport Bundesliga', country: 'DE', priority: 10 },
    { name: 'beIN Sports 2', country: 'INT', priority: 9 },
    { name: 'ESPN+', country: 'US', priority: 8 },
  ],
  'Italian Serie A': [
    { name: 'beIN Sports 3', country: 'INT', priority: 10 },
    { name: 'CBS Sports', country: 'US', priority: 9 },
    { name: 'Paramount+', country: 'US', priority: 8 },
  ],
  'French Ligue 1': [
    { name: 'beIN Sports 1', country: 'FR', priority: 10 },
    { name: 'beIN Sports 2', country: 'INT', priority: 9 },
  ],
};

// Default channels for leagues not in the mapping
const DEFAULT_CHANNELS = [
  { name: 'beIN Sports 1', country: 'INT', priority: 5 },
  { name: 'ESPN', country: 'US', priority: 4 },
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

interface CDNChannel {
  id: string;
  name: string;
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

// Build CDN-Live embed URL
function buildCDNUrl(channelName: string, country: string): string {
  return `https://cdn-live.tv/api/v1/vip/damitv/channels/player/?name=${encodeURIComponent(channelName)}&code=${country}`;
}

// Get channels for a league
function getChannelsForLeague(leagueName: string): CDNChannel[] {
  const leagueChannels = LEAGUE_CHANNELS[leagueName] || DEFAULT_CHANNELS;
  
  return leagueChannels.map((ch, index) => ({
    id: `${ch.name.toLowerCase().replace(/\s+/g, '-')}-${ch.country.toLowerCase()}`,
    name: ch.name,
    country: ch.country,
    logo: '', // Could add logos later
    embedUrl: buildCDNUrl(ch.name, ch.country),
  }));
}

// Get priority for a league
function getLeaguePriority(leagueId: string): number {
  const league = POPULAR_LEAGUES.find(l => l.id === leagueId);
  return league?.priority || 5;
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
            channels: getChannelsForLeague(match.strLeague),
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
            channels: getChannelsForLeague(match.strLeague),
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
            channels: getChannelsForLeague(league.name),
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

    // Filter to only show matches within next 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filteredMatches = allMatches.filter(match => {
      const matchDate = new Date(match.timestamp);
      return matchDate <= sevenDaysFromNow;
    });

    // Limit to 30 matches
    const limitedMatches = filteredMatches.slice(0, 30);
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
