
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
    // More detailed logging
    console.log(`Fetching stream from source: ${source}, id: ${id}`);
    console.log(`Full API URL: ${API_BASE}/stream/${source}/${id}`);
    
    // Modified fetch with better error handling
    const fetchWithRetry = async (attempts = 3): Promise<Response> => {
      try {
        // Using a more streamlined set of headers - removing potential restrictive headers
        const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          // Cache control
          cache: 'no-cache',
          // Handle CORS mode - changing to cors to better handle restrictions
          mode: 'cors',
          // Reduced credential mode to avoid CORS issues
          credentials: 'same-origin',
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          console.error(`Stream fetch failed (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch stream: ${response.status} ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        if (attempts > 1) {
          console.log(`Retry attempt ${4 - attempts} for stream fetch...`);
          // Exponential backoff with jitter
          const delay = Math.floor(1000 * Math.random()) + 1000 * (4 - attempts);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(attempts - 1);
        }
        throw error;
      }
    };
    
    // Try alternative endpoint if primary fails
    const tryFetchStream = async () => {
      try {
        return await fetchWithRetry();
      } catch (error) {
        console.log('Primary endpoint failed, trying backup...');
        
        // If we failed with the standard endpoint, try an alternative approach
        // For example, using a different format or path structure
        const altResponse = await fetch(`${API_BASE}/streams/${source}/${id}`, {
          cache: 'no-cache',
          mode: 'cors',
        });
        
        if (!altResponse.ok) throw new Error('Both primary and backup endpoints failed');
        return altResponse;
      }
    };
    
    const response = await tryFetchStream();
    let data;
    
    try {
      data = await response.json();
      console.log('Stream API response data:', data);
    } catch (parseError) {
      console.error('Error parsing stream JSON response:', parseError);
      // Return a default error stream
      return {
        id: "error",
        streamNo: 0,
        language: "unknown",
        hd: false,
        embedUrl: "",
        source: "error"
      };
    }
    
    // Better handling of different response formats
    if (Array.isArray(data) && data.length > 0) {
      // Prefer HD stream if available
      const hdStream = data.find(stream => stream.hd === true);
      const selectedStream = hdStream || data[0];
      console.log('Selected stream (from array):', selectedStream);
      
      // Validate that we have an embedUrl
      if (!selectedStream.embedUrl || typeof selectedStream.embedUrl !== 'string') {
        console.error('Invalid embedUrl in stream data:', selectedStream);
        throw new Error('Stream data missing valid embedUrl');
      }
      
      return selectedStream;
    }
    
    // If it's not an array, but a single object, return it
    if (data && typeof data === 'object' && data.id) {
      console.log('Selected stream (single object):', data);
      
      // Validate that we have an embedUrl
      if (!data.embedUrl || typeof data.embedUrl !== 'string') {
        console.error('Invalid embedUrl in stream data:', data);
        throw new Error('Stream data missing valid embedUrl');
      }
      
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
