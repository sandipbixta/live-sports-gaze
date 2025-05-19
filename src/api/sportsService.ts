
import { Sport, Match } from '../types/sports';
import { API_BASE, FALLBACK_API_BASE, REQUEST_TIMEOUT } from './constants';

/**
 * Fetches all available sports from the API
 */
export const fetchSports = async (): Promise<Sport[]> => {
  try {
    console.log('Fetching sports from API:', `${API_BASE}/sports`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${API_BASE}/sports`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Sports API error (${response.status})`);
      throw new Error(`Failed to fetch sports: ${response.status}`);
    }
    
    // Verify content-type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Sports API returned non-JSON response:', contentType);
      return []; // Return empty array as fallback
    }
    
    const data = await response.json();
    console.log('Sports data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching sports:', error);
    
    // Return default sports as fallback
    return [
      { id: "football", name: "Football" },
      { id: "basketball", name: "Basketball" },
      { id: "hockey", name: "Hockey" },
      { id: "baseball", name: "Baseball" },
      { id: "tennis", name: "Tennis" }
    ];
  }
};

/**
 * Fetches all matches for a specific sport
 */
export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  try {
    const endpoint = `${API_BASE}/matches/${sportId}`;
    console.log('Fetching matches from API:', endpoint);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Matches API error (${response.status})`);
      throw new Error(`Failed to fetch matches: ${response.status}`);
    }
    
    // Verify content-type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Matches API returned non-JSON response:', contentType);
      return []; // Return empty array as fallback
    }
    
    const data = await response.json();
    console.log(`Matches for ${sportId}:`, data ? data.length : 0);
    
    // Transform data if needed to match our Match interface
    return data.map((match: any) => ({
      id: match.id || '',
      title: match.title || '',
      date: match.date ? new Date(match.date).toISOString() : new Date().toISOString(),
      teams: match.teams,
      sources: match.sources || [],
      sportId: sportId,
      poster: match.poster || ''
    }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

/**
 * Fetches a specific match by ID for a given sport
 */
export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  try {
    // Try direct match endpoint first if available
    const directEndpoint = `${API_BASE}/match/${sportId}/${matchId}`;
    console.log('Trying direct match endpoint:', directEndpoint);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const directResponse = await fetch(directEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (directResponse.ok) {
        const contentType = directResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const match = await directResponse.json();
          console.log('Direct match data:', match);
          return {
            ...match,
            sportId
          };
        }
      }
    } catch (directError) {
      console.log('Direct match endpoint failed, falling back to match list');
    }
    
    // If direct endpoint fails, fall back to fetching all matches
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      console.error('Match not found in list');
      throw new Error('Match not found');
    }
    
    console.log('Match found in list:', match);
    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    
    // Return minimal match object with error flag
    return {
      id: matchId,
      title: "Match Not Found",
      date: new Date().toISOString(),
      teams: undefined,
      sources: [],
      sportId,
      error: true
    };
  }
};
