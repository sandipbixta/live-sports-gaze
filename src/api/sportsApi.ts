
import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.su/api';

export const fetchSports = async (): Promise<Sport[]> => {
  try {
    const response = await fetch(`${API_BASE}/sports`);
    if (!response.ok) throw new Error('Failed to fetch sports');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sports:', error);
    return [];
  }
};

export const fetchMatches = async (sportId: string): Promise<Match[]> => {
  try {
    const response = await fetch(`${API_BASE}/matches/${sportId}`);
    if (!response.ok) throw new Error('Failed to fetch matches');
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  try {
    // First fetch all matches for this sport
    const matches = await fetchMatches(sportId);
    // Then find the specific match by ID
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    // Improved logging
    console.log(`Fetching stream from source: ${source}, id: ${id}`);
    console.log(`Full API URL: ${API_BASE}/stream/${source}/${id}`);
    
    // Handle potential CORS issues with retry mechanism
    const fetchWithRetry = async (attempts = 3): Promise<Response> => {
      try {
        const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
          headers: {
            'Accept': 'application/json',
          },
          // Adding cache control to avoid stale responses
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stream: ${response.status} ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        if (attempts > 1) {
          console.log(`Retry attempt ${4 - attempts} for stream fetch...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return fetchWithRetry(attempts - 1);
        }
        throw error;
      }
    };
    
    const response = await fetchWithRetry();
    const data = await response.json();
    
    console.log('Stream API response:', data);
    
    // Better handling of different response formats
    if (Array.isArray(data) && data.length > 0) {
      // Prefer HD stream if available
      const hdStream = data.find(stream => stream.hd === true);
      console.log('Selected stream (from array):', hdStream || data[0]);
      return hdStream || data[0];
    }
    
    // If it's not an array, but a single object, return it
    if (data && typeof data === 'object' && data.id) {
      console.log('Selected stream (single object):', data);
      return data as Stream;
    }
    
    // If we get here, we couldn't get a valid stream object
    throw new Error('Invalid stream data received');
  } catch (error) {
    console.error('Error fetching stream:', error);
    // Return a default stream object that indicates an error
    return {
      id: "error",
      streamNo: 0,
      language: "unknown",
      hd: false,
      embedUrl: "",
      source: "error"
    };
  }
};
