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
    const matches = await response.json();
    
    // Log the raw response to see what we're getting
    console.log('fetchMatches - Raw API response:', matches);
    
    // Return ALL sources without any filtering
    const processedMatches = matches.map((match: Match) => {
      console.log(`Match ${match.id} has ${match.sources?.length || 0} sources:`, match.sources);
      return match;
    });
    
    return processedMatches;
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
    
    console.log(`fetchMatch - Found match with ${match.sources?.length || 0} sources:`, match.sources);
    
    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string): Promise<Stream | Stream[]> => {
  try {
    // More detailed logging
    console.log(`Fetching stream data: source=${source}, id=${id}`);
    
    // Define the correct API endpoints based on your provided schema
    const endpoints = [
      `${API_BASE}/stream/${source}/${id}`, // Primary endpoint using your schema
      `${API_BASE}/streams/${source}/${id}`, // Alternative endpoint
    ];
    
    // Enhanced fetch with better retry and error handling
    const fetchFromEndpoint = async (url: string, attemptNumber: number): Promise<Response> => {
      console.log(`Trying endpoint ${attemptNumber}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always get fresh content
        mode: 'cors',
        credentials: 'omit', // Don't send cookies to avoid CORS issues
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`Stream API error (${response.status}): ${errorText}`);
        throw new Error(`Failed with status ${response.status}`);
      }
      
      return response;
    };
    
    // Try each endpoint with retries
    let lastError: Error | null = null;
    
    for (let i = 0; i < endpoints.length; i++) {
      try {
        const response = await fetchFromEndpoint(endpoints[i], i + 1);
        console.log(`Successfully fetched stream from endpoint ${i + 1}`);
        
        // Parse and validate response
        const data = await response.json();
        console.log('Stream API response data:', data);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          // Multiple streams returned - each should have unique embedUrl
          console.log(`Found ${data.length} streams from API`);
          return data.map((stream, index) => ({
            ...stream,
            id: stream.id || `${source}-${id}-${index}`,
            embedUrl: ensureValidEmbedUrl(stream.embedUrl || ''),
            source: source,
            language: stream.language || `Language ${index + 1}`,
            streamNo: stream.streamNo || index + 1
          }));
        } else if (data && typeof data === 'object') {
          // Single stream object or nested structure
          if (data.streams && Array.isArray(data.streams)) {
            // API returned an object with a streams array
            console.log(`Found ${data.streams.length} streams in streams array`);
            return data.streams.map((stream: any, index: number) => ({
              ...stream,
              id: stream.id || `${source}-${id}-${index}`,
              embedUrl: ensureValidEmbedUrl(stream.embedUrl || ''),
              source: source,
              language: stream.language || `Language ${index + 1}`,
              streamNo: stream.streamNo || index + 1
            }));
          } else if (data.embedUrl) {
            // Single stream
            return {
              ...data,
              id: data.id || `${source}-${id}`,
              embedUrl: ensureValidEmbedUrl(data.embedUrl),
              source: source,
              language: data.language || 'Default',
              streamNo: data.streamNo || 1
            };
          }
        }
        
        // If we get here, data format was unexpected
        throw new Error('Unexpected data format from API');
        
      } catch (error) {
        console.warn(`Endpoint ${i + 1} failed: ${(error as Error).message}`);
        lastError = error as Error;
      }
    }
    
    // If we get here, we've tried all endpoints
    console.error('All stream endpoints failed:', lastError);
    
    // Return demo stream data with multiple language options
    return getDemoStreamData(source, id);
    
  } catch (error) {
    console.error('Error in fetchStream:', error);
    return getDemoStreamData(source, id);
  }
};

// Helper function to ensure embed URL is valid
function ensureValidEmbedUrl(url: string): string {
  // Return the provided URL if it seems valid
  if (url && url.startsWith('http')) {
    return url;
  }
  
  // Otherwise return a demo URL
  return getDemoStreamData("default", "demo")[0].embedUrl;
}

// Provides demo streams with different languages when actual streams aren't available
function getDemoStreamData(source: string, id: string): Stream[] {
  console.log('Using demo stream data with multiple languages');
  
  // Create multiple demo streams with different languages
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian'];
  
  return languages.map((language, index) => ({
    id: `demo-${id}-${language.toLowerCase()}-${Date.now()}-${index}`,
    streamNo: index + 1,
    language: language,
    hd: index < 2, // First two are HD
    // Use different demo embed URLs for each language
    embedUrl: `https://www.youtube.com/embed/live_stream?channel=demo_${language.toLowerCase()}&autoplay=1&mute=0&t=${Date.now()}`,
    source: source || "demo"
  }));
}
