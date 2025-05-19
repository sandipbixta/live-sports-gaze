import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.su/api';

// Adding a fallback base URL for cases where primary API is down
const FALLBACK_API_BASE = 'https://sports-api.backup-domain.com/api';

// New API endpoint for fetching streams
const STREAMS_API = 'https://api.streamed.su/api/streams';

// Interface for the streams API response
export interface StreamsApiResponse {
  success: boolean;
  timestamp: number;
  READ_ME: string;
  performance: number;
  streams: StreamCategory[];
}

export interface StreamCategory {
  category: string;
  id: number;
  always_live: number; // 0 = no, 1 = yes
  streams: StreamInfo[];
}

export interface StreamInfo {
  id: number;
  name: string;
  tag: string;
  poster: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number; // 0 = no, 1 = yes
  category_name: string;
  iframe?: string; // Optional iframe for direct embedding
  allowpaststreams: number; // 0 = no, 1 = yes
}

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
    
    // Add user-agent and origin headers to help with CORS and browser compatibility
    const headers = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Origin': window.location.origin,
      'Referer': window.location.href,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    };
    
    // Make the request with additional headers and options for troubleshooting
    const response = await fetch(endpoint, {
      headers,
      cache: 'no-store', // Always get fresh content
      mode: 'cors',
      credentials: 'omit', // Don't send cookies to avoid CORS issues
      referrerPolicy: 'no-referrer-when-downgrade'
    });
    
    // Check if response is successful
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`Stream API error (${response.status}): ${errorText}`);
      
      // Try fallback API if main API fails
      console.log('Trying fallback API endpoint...');
      const fallbackResponse = await fetch(`${FALLBACK_API_BASE}/stream/${source}/${id}`, {
        headers, 
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
      embedUrl: generateCrossBrowserUrl(`https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw&autoplay=0&mute=0`),
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
      const embedUrl = generateCrossBrowserUrl(hdStream.embedUrl);
      return {
        ...hdStream,
        embedUrl
      };
    } 
    // Handle object response format
    else if (data && typeof data === 'object' && data.embedUrl) {
      console.log('Using single object stream data');
      const embedUrl = generateCrossBrowserUrl(data.embedUrl);
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

// Enhanced URL validation and transformation for cross-browser compatibility
function generateCrossBrowserUrl(url: string): string {
  if (!url) return '';
  
  let processedUrl = url;
  
  // Remove any parameters that might cause issues in some browsers
  const problematicParams = ['autoplay=1', 'mute=1', 'allowfullscreen=true'];
  problematicParams.forEach(param => {
    processedUrl = processedUrl
      .replace(`${param}&`, '')  // Middle of query string
      .replace(`&${param}`, '')  // End of query string
      .replace(`?${param}`, '?') // Start of query string
      .replace(param, '');       // Only param
  });
  
  // Fix query string if it's malformed after removing parameters
  if (processedUrl.endsWith('?')) {
    processedUrl = processedUrl.slice(0, -1);
  }
  
  // Add necessary parameters for better compatibility
  const separator = processedUrl.includes('?') ? '&' : '?';
  processedUrl = `${processedUrl}${separator}autoplay=0&mute=0&allowfullscreen=true`;
  
  // Check if URL already has protocol
  if (processedUrl.startsWith('http://') || processedUrl.startsWith('https://')) {
    return processedUrl;
  }
  
  // If URL starts with //, add https:
  if (processedUrl.startsWith('//')) {
    return `https:${processedUrl}`;
  }
  
  // If URL is relative, convert to absolute
  if (processedUrl.startsWith('/')) {
    try {
      const baseUrl = new URL(API_BASE).origin;
      return `${baseUrl}${processedUrl}`;
    } catch (e) {
      console.error('Error converting relative URL:', e);
      return `https://streamed.su${processedUrl}`;
    }
  }
  
  // Default case - assume https
  return `https://${processedUrl}`;
}

// Fallback demo stream data
function getDemoStreamData(source: string, id: string): Stream {
  console.log('Using demo stream data');
  return {
    id: `demo-${id}`,
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw&autoplay=0&mute=0&allowfullscreen=true",
    source: source || "demo"
  };
}

/**
 * Fetches all available streams from the streams API endpoint
 * Response includes categorized streams with detailed information
 * @returns Promise with StreamsApiResponse containing all stream categories and their streams
 */
export const fetchStreamsApi = async (): Promise<StreamsApiResponse> => {
  try {
    console.log('Fetching streams from API:', STREAMS_API);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(STREAMS_API, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`Streams API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch streams: ${response.status}`);
    }
    
    const data: StreamsApiResponse = await response.json();
    console.log('Streams API response:', data);
    
    // Validate response structure
    if (!data.success || !Array.isArray(data.streams)) {
      console.error('Invalid streams API response format:', data);
      throw new Error('Invalid streams API response format');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching streams API:', error);
    
    // Return a minimal valid response structure with empty streams
    return {
      success: false,
      timestamp: Math.floor(Date.now() / 1000),
      READ_ME: "API request failed. Please try again later.",
      performance: 0,
      streams: []
    };
  }
};

/**
 * Converts a StreamInfo object to our app's Match format
 * @param streamInfo StreamInfo object from the API
 * @returns Match object compatible with our app
 */
export const convertStreamInfoToMatch = (streamInfo: StreamInfo): Match => {
  // Extract team names from the stream name if possible
  const teamNames = streamInfo.name.split(' at ');
  const hasTeams = teamNames.length === 2;
  
  return {
    id: streamInfo.id.toString(),
    title: streamInfo.name,
    date: new Date(streamInfo.starts_at * 1000).toISOString(),
    teams: hasTeams ? {
      home: { name: teamNames[1].trim() },
      away: { name: teamNames[0].trim() }
    } : undefined,
    sources: [
      {
        source: streamInfo.category_name.toLowerCase(),
        id: streamInfo.uri_name
      }
    ],
    sportId: streamInfo.category_name.toLowerCase(),
    // If iframe is directly provided in the API, we can use it for embedding
    ...(streamInfo.iframe && {
      embedUrl: streamInfo.iframe
    })
  };
};
