import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPORTS_DB_API_KEY = '3'; // Free tier API key
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching popular matches from TheSportsDB...');
    
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
          const isLive = event.strStatus === 'Match Finished' ? false : 
                        (event.strProgress && event.strProgress !== 'NS') ? true :
                        (eventDate <= now && eventDate.getTime() + 3 * 60 * 60 * 1000 > now.getTime());
          
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
          };
        });
      } catch (error) {
        console.error(`Error fetching league ${league.name}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(fetchPromises);
    results.forEach(matches => allMatches.push(...matches));
    
    // Sort by date/time (upcoming first)
    allMatches.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Filter to only show matches within next 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filteredMatches = allMatches.filter(match => {
      const matchDate = new Date(match.timestamp);
      return matchDate >= now && matchDate <= sevenDaysFromNow;
    });
    
    // Limit to 20 matches
    const limitedMatches = filteredMatches.slice(0, 20);
    
    console.log(`Returning ${limitedMatches.length} popular matches`);
    
    return new Response(
      JSON.stringify({ 
        matches: limitedMatches,
        total: limitedMatches.length,
        fetchedAt: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
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
