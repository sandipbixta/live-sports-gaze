import { Match } from '../types/sports';

const STREAMSU_API_BASE = 'https://streamed.su/api';

// Cache for Stream.su API responses
const streamSuCache = new Map<string, { data: any; timestamp: number }>();
const STREAMSU_CACHE_DURATION = 1 * 60 * 1000; // 1 minute

// Helper function to get cached data
const getStreamSuCachedData = (key: string) => {
  const cached = streamSuCache.get(key);
  if (cached && Date.now() - cached.timestamp < STREAMSU_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setStreamSuCachedData = (key: string, data: any) => {
  streamSuCache.set(key, { data, timestamp: Date.now() });
};

// Interface for Stream.su API response
interface StreamSuMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular?: boolean;
  teams?: {
    home: { name: string };
    away: { name: string };
  };
  sources?: Array<{
    source: string;
    id: string;
  }>;
  sportId?: string;
}

// Transform Stream.su match to our Match format
const transformStreamSuMatch = (match: StreamSuMatch): Match => {
  // Extract team names from the title if teams are not provided
  let homeTeam = '';
  let awayTeam = '';
  
  if (!match.teams) {
    const vsMatch = match.title.match(/^(.+?)\s+(?:vs|v|@|at)\s+(.+)$/i);
    if (vsMatch) {
      homeTeam = vsMatch[1].trim();
      awayTeam = vsMatch[2].trim();
    }
  }

  return {
    id: `streamsu-${match.id}`,
    title: match.title,
    category: 'football',
    date: match.date,
    poster: match.poster || '',
    popular: match.popular || false,
    teams: match.teams || (homeTeam && awayTeam ? {
      home: { name: homeTeam },
      away: { name: awayTeam }
    } : undefined),
    sources: match.sources || [{
      source: 'streamed.su',
      id: match.id
    }],
    sportId: 'football'
  };
};

export const fetchFootballFromStreamSu = async (): Promise<Match[]> => {
  const cacheKey = 'streamsu-football';
  const cached = getStreamSuCachedData(cacheKey);
  if (cached) return cached;

  try {
    // Try different endpoints that might exist on Stream.su
    const endpoints = [
      `${STREAMSU_API_BASE}/matches/football`,
      `${STREAMSU_API_BASE}/matches/soccer`,
      `${STREAMSU_API_BASE}/matches/live`,
      `${STREAMSU_API_BASE}/live/football`
    ];

    let footballMatches: Match[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          continue; // Try next endpoint
        }

        const data = await response.json();
        
        // Handle different response formats
        let matches: StreamSuMatch[] = [];
        
        if (Array.isArray(data)) {
          matches = data;
        } else if (data.matches && Array.isArray(data.matches)) {
          matches = data.matches;
        } else if (data.data && Array.isArray(data.data)) {
          matches = data.data;
        } else if (data.football && Array.isArray(data.football)) {
          matches = data.football;
        }

        // Filter for football/soccer matches
        const footballData = matches.filter(match => {
          const category = (match.category || '').toLowerCase();
          const title = (match.title || '').toLowerCase();
          return (category.includes('football') || category.includes('soccer') || 
                  title.includes('football') || title.includes('soccer')) &&
                 !category.includes('american') && !title.includes('nfl');
        });

        if (footballData.length > 0) {
          footballMatches = footballData.map(transformStreamSuMatch);
          console.log(`✅ Found ${footballMatches.length} football matches from Stream.su via ${endpoint}`);
          break; // Stop trying other endpoints
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError);
        continue;
      }
    }

    // Filter to only include current and upcoming matches
    const currentTime = Date.now();
    const activeMatches = footballMatches.filter(match => {
      const matchEndTime = match.date + (3 * 60 * 60 * 1000); // 3 hours after start
      return matchEndTime > currentTime;
    });

    setStreamSuCachedData(cacheKey, activeMatches);
    console.log(`✅ Fetched ${activeMatches.length} active football matches from Stream.su`);
    
    return activeMatches;
  } catch (error) {
    console.error('Error fetching football from Stream.su:', error);
    // Return empty array on error rather than throwing to avoid breaking the entire app
    return [];
  }
};