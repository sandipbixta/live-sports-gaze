import { Match } from '../types/sports';

const PPV_API_BASE = 'https://ppv.to/api';

// Cache for PPV API responses
const ppvCache = new Map<string, { data: any; timestamp: number }>();
const PPV_CACHE_DURATION = 1 * 60 * 1000; // 1 minute as recommended

// Helper function to get cached data
const getPPVCachedData = (key: string) => {
  const cached = ppvCache.get(key);
  if (cached && Date.now() - cached.timestamp < PPV_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setPPVCachedData = (key: string, data: any) => {
  ppvCache.set(key, { data, timestamp: Date.now() });
};

// Interface for PPV.to API response
interface PPVStream {
  id: number;
  name: string;
  tag: string;
  poster: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number;
  category_name: string;
  iframe?: string;
  allowpaststreams: number;
}

interface PPVCategory {
  category: string;
  id: number;
  always_live: number;
  streams: PPVStream[];
}

interface PPVResponse {
  success: boolean;
  timestamp: number;
  READ_ME: string;
  performance: number;
  streams: PPVCategory[];
}

// Transform PPV stream to our Match format
const transformPPVStreamToMatch = (stream: PPVStream): Match => {
  // Extract team names from the stream name
  const title = stream.name;
  let homeTeam = '';
  let awayTeam = '';
  
  // Try to parse team names from common patterns like "Team A vs Team B" or "Team A @ Team B"
  const vsMatch = title.match(/^(.+?)\s+(?:vs|v|@|at)\s+(.+)$/i);
  if (vsMatch) {
    homeTeam = vsMatch[1].trim();
    awayTeam = vsMatch[2].trim();
  }

  return {
    id: `ppv-${stream.id}`,
    title: stream.name,
    category: 'football',
    date: stream.starts_at * 1000, // Convert to milliseconds
    poster: stream.poster,
    popular: false, // PPV doesn't provide popularity info
    teams: vsMatch ? {
      home: { name: homeTeam },
      away: { name: awayTeam }
    } : undefined,
    sources: [{
      source: 'ppv',
      id: stream.uri_name
    }],
    sportId: 'football'
  };
};

export const fetchFootballFromPPV = async (): Promise<Match[]> => {
  const cacheKey = 'ppv-football';
  const cached = getPPVCachedData(cacheKey);
  if (cached) {
    console.log(`🏈 Returning ${cached.length} cached PPV football matches`);
    return cached;
  }

  console.log('🏈 Fetching football matches from PPV.to...');

  try {
    const response = await fetch(`${PPV_API_BASE}/streams`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('🏈 PPV API response status:', response.status);

    if (!response.ok) {
      throw new Error(`PPV API Error: ${response.status} ${response.statusText}`);
    }

    const data: PPVResponse = await response.json();
    console.log('🏈 PPV API data received:', { success: data.success, categories: data.streams?.length });

    if (!data.success || !Array.isArray(data.streams)) {
      throw new Error('Invalid PPV API response format');
    }

    // Find football/soccer category and extract matches (exclude American football)
    const footballMatches: Match[] = [];
    
    for (const category of data.streams) {
      // Look for football/soccer categories but exclude American football
      const categoryName = category.category.toLowerCase();
      console.log('🏈 Checking PPV category:', categoryName);
      
      if ((categoryName.includes('football') || categoryName.includes('soccer')) && 
          !categoryName.includes('american') && 
          !categoryName.includes('nfl')) {
        const matches = category.streams.map(transformPPVStreamToMatch);
        footballMatches.push(...matches);
        console.log(`📋 Found ${matches.length} soccer matches in category: ${category.category}`);
      }
    }

    console.log(`🏈 Total PPV football matches found: ${footballMatches.length}`);

    // Filter to only include current and upcoming matches (not past ones)
    const currentTime = Date.now();
    const activeMatches = footballMatches.filter(match => {
      // Include matches that haven't ended yet (assuming 3-hour duration if no end time)
      const matchEndTime = match.date + (3 * 60 * 60 * 1000); // 3 hours after start
      return matchEndTime > currentTime;
    });

    console.log(`🏈 Active PPV football matches: ${activeMatches.length}`);
    setPPVCachedData(cacheKey, activeMatches);
    
    return activeMatches;
  } catch (error) {
    console.error('❌ Error fetching football from PPV.to:', error);
    // Return empty array on error rather than throwing to avoid breaking the entire app
    return [];
  }
};