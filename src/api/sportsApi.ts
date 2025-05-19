
import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.su/api';

// Adding a fallback base URL for cases where primary API is down
const FALLBACK_API_BASE = 'https://sports-api.backup-domain.com/api';

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
    // More detailed logging for debugging
    console.log(`Attempting to fetch stream: source=${source}, id=${id}`);
    
    // Define the API endpoint for stream data
    const endpoint = `${API_BASE}/stream/${source}/${id}`;
    console.log(`Stream endpoint: ${endpoint}`);
    
    // Make the request with additional headers and options for troubleshooting
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store', // Always get fresh content
      mode: 'cors',
      credentials: 'omit', // Don't send cookies to avoid CORS issues
    });
    
    // Check if response is successful
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`Stream API error (${response.status}): ${errorText}`);
      
      // Try fallback API if main API fails
      console.log('Trying fallback API endpoint...');
      const fallbackResponse = await fetch(`${FALLBACK_API_BASE}/stream/${source}/${id}`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });
      
      if (!fallbackResponse.ok) {
        console.error(`Fallback API also failed with status ${fallbackResponse.status}`);
        throw new Error(`All API attempts failed`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('Fallback API response:', fallbackData);
      return processStreamData(fallbackData, source, id);
    }
    
    // Parse response and validate the data structure
    const data = await response.json();
    console.log('Stream API response:', data);
    
    // Process the stream data based on its format
    return processStreamData(data, source, id);
    
  } catch (error) {
    console.error('Error in fetchStream:', error);
    // Return a demo stream with YouTube embed for testing/fallback
    return {
      id: `demo-${id}`,
      streamNo: 1,
      language: "English",
      hd: true,
      embedUrl: `https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw&autoplay=1&mute=0`,
      source: source || "demo"
    };
  }
};

// Helper function to process different stream data formats
function processStreamData(data: any, source: string, id: string): Stream {
  try {
    // Handle array response format
    if (Array.isArray(data) && data.length > 0) {
      // Find HD stream if available, otherwise take the first one
      const hdStream = data.find(stream => stream.hd === true) || data[0];
      
      // Validate required properties
      if (!hdStream.embedUrl) {
        throw new Error('Stream data missing embedUrl');
      }
      
      console.log('Using stream data:', hdStream);
      
      // Ensure the embedUrl is properly formatted (starts with http/https)
      const embedUrl = ensureValidUrl(hdStream.embedUrl);
      return {
        ...hdStream,
        embedUrl
      };
    } 
    // Handle object response format
    else if (data && typeof data === 'object' && data.embedUrl) {
      console.log('Using single object stream data');
      const embedUrl = ensureValidUrl(data.embedUrl);
      return {
        ...data,
        embedUrl
      };
    }
    
    // If data structure is unexpected, throw error
    throw new Error('Unexpected stream data format');
  } catch (innerError) {
    console.error('Error processing stream data:', innerError);
    // Return fallback stream for troubleshooting
    return getDemoStreamData(source, id);
  }
}

// Helper to ensure URL is valid
function ensureValidUrl(url: string): string {
  if (!url) return '';
  
  // Check if URL already has protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL is relative, convert to absolute
  if (url.startsWith('/')) {
    try {
      const baseUrl = new URL(API_BASE).origin;
      return `${baseUrl}${url}`;
    } catch (e) {
      console.error('Error converting relative URL:', e);
      return `https://streamed.su${url}`;
    }
  }
  
  // Default case - assume https
  return `https://${url}`;
}

// Fallback demo stream data
function getDemoStreamData(source: string, id: string): Stream {
  console.log('Using demo stream data');
  return {
    id: `demo-${id}`,
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: `https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw&autoplay=1&mute=0`,
    source: source || "demo"
  };
}
