import { Match } from '../types/sports';

const STREAMEDPK_API_BASE = 'https://streamed.pk/api';

// Cache for Streamed.pk API responses
const streamedPkCache = new Map<string, { data: any; timestamp: number }>();
const STREAMEDPK_CACHE_DURATION = 1 * 60 * 1000; // 1 minute

// Helper function to get cached data
const getStreamedPkCachedData = (key: string) => {
  const cached = streamedPkCache.get(key);
  if (cached && Date.now() - cached.timestamp < STREAMEDPK_CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setStreamedPkCachedData = (key: string, data: any) => {
  streamedPkCache.set(key, { data, timestamp: Date.now() });
};

// Transform Streamed.pk match to our Match format
const transformStreamedPkMatch = (match: any): Match => {
  return {
    id: `streamedpk-${match.id}`,
    title: match.title,
    category: match.category || 'football',
    date: match.date,
    poster: match.poster ? `https://streamed.pk${match.poster}` : '',
    popular: match.popular || false,
    teams: match.teams ? {
      home: {
        name: match.teams.home?.name || '',
        badge: match.teams.home?.badge,
        logo: match.teams.home?.logo
      },
      away: {
        name: match.teams.away?.name || '',
        badge: match.teams.away?.badge,
        logo: match.teams.away?.logo
      }
    } : undefined,
    sources: match.sources || [{
      source: 'streamed.pk',
      id: match.id
    }],
    sportId: 'football'
  };
};

export const fetchFootballFromStreamedPk = async (): Promise<Match[]> => {
  const cacheKey = 'streamedpk-football';
  const cached = getStreamedPkCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log('🏈 Fetching football matches from Streamed.pk API...');
    
    // Fetch football matches directly from the football endpoint
    const response = await fetch(`${STREAMEDPK_API_BASE}/matches/football`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Streamed.pk API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The API should return an array of football matches
    if (!Array.isArray(data)) {
      console.warn('Unexpected Streamed.pk API response format:', data);
      return [];
    }

    console.log(`📥 Received ${data.length} football matches from Streamed.pk`);

    // Transform matches to our format
    const transformedMatches = data.map(match => transformStreamedPkMatch(match));

    // Filter to only include current and upcoming matches
    const currentTime = Date.now();
    const activeMatches = transformedMatches.filter(match => {
      const matchEndTime = match.date + (3 * 60 * 60 * 1000); // 3 hours after start
      return matchEndTime > currentTime;
    });

    setStreamedPkCachedData(cacheKey, activeMatches);
    console.log(`✅ Fetched ${activeMatches.length} active football matches from Streamed.pk`);
    
    return activeMatches;
  } catch (error) {
    console.error('Error fetching football from Streamed.pk:', error);
    
    // Return empty array on error rather than throwing to avoid breaking the entire app
    console.log('📝 Streamed.pk football fetch failed, returning empty array');
    return [];
  }
};