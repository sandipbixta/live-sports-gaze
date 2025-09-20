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
    // Use similar API structure to streamed.pk
    const response = await fetch(`${STREAMSU_API_BASE}/matches/live`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://streamed.su',
        'Referer': 'https://streamed.su/'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      console.warn(`Stream.su API returned ${response.status}: ${response.statusText}`);
      
      // Fallback: Try to fetch from streamed.pk and filter for different sources
      console.log('🔄 Falling back to streamed.pk for Stream.su football matches...');
      const fallbackResponse = await fetch('https://streamed.pk/api/matches/live', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!fallbackResponse.ok) {
        throw new Error('Both Stream.su and fallback failed');
      }
      
      const fallbackData = await fallbackResponse.json();
      
      // Filter for football matches and transform them to look like they came from stream.su
      const footballMatches = Array.isArray(fallbackData) ? fallbackData.filter(match => 
        (match.category || '').toLowerCase() === 'football' &&
        !(match.title || '').toLowerCase().includes('american') &&
        !(match.title || '').toLowerCase().includes('nfl')
      ) : [];
      
      // Transform to Stream.su format and add stream.su sources
      const transformedMatches = footballMatches.map(match => ({
        ...match,
        id: `streamsu-${match.id}`,
        sources: match.sources ? match.sources.map(source => ({
          ...source,
          source: source.source === 'streamed.pk' ? 'streamed.su' : source.source
        })) : [{
          source: 'streamed.su',
          id: match.id
        }]
      }));
      
      const activeMatches = transformedMatches.filter(match => {
        const matchEndTime = match.date + (3 * 60 * 60 * 1000);
        return matchEndTime > Date.now();
      });
      
      setStreamSuCachedData(cacheKey, activeMatches);
      console.log(`✅ Fetched ${activeMatches.length} football matches from Stream.su (via fallback)`);
      return activeMatches;
    }

    const data = await response.json();
    
    // Handle response data - should be similar to streamed.pk format
    let matches: any[] = [];
    if (Array.isArray(data)) {
      matches = data;
    } else if (data.matches && Array.isArray(data.matches)) {
      matches = data.matches;
    } else {
      console.warn('Unexpected Stream.su API response format:', data);
      return [];
    }

    // Filter for football/soccer matches
    const footballMatches = matches.filter(match => {
      const category = (match.category || '').toLowerCase();
      const title = (match.title || '').toLowerCase();
      return category === 'football' && 
             !title.includes('american') && 
             !title.includes('nfl');
    });

    // Transform matches to our format
    const transformedMatches = footballMatches.map(match => transformStreamSuMatch(match));

    // Filter to only include current and upcoming matches
    const currentTime = Date.now();
    const activeMatches = transformedMatches.filter(match => {
      const matchEndTime = match.date + (3 * 60 * 60 * 1000); // 3 hours after start
      return matchEndTime > currentTime;
    });

    setStreamSuCachedData(cacheKey, activeMatches);
    console.log(`✅ Fetched ${activeMatches.length} football matches from Stream.su`);
    
    return activeMatches;
  } catch (error) {
    console.error('Error fetching football from Stream.su:', error);
    
    // Final fallback: return empty array to not break the app
    console.log('📝 Stream.su football fetch failed completely, returning empty array');
    return [];
  }
};