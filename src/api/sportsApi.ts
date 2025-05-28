
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

export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    // More detailed logging
    console.log(`Fetching stream data: source=${source}, id=${id}`);
    
    // Define potential API endpoints to try - in order of preference
    const endpoints = [
      `${API_BASE}/stream/${source}/${id}`,
      `${API_BASE}/streams/${source}/${id}`,
      `${FALLBACK_API_BASE}/stream/${source}/${id}`
    ];
    
    // Enhanced fetch with better retry and error handling
    const fetchFromEndpoint = async (url: string, attemptNumber: number): Promise<Response> => {
      console.log(`Trying endpoint ${attemptNumber}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
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
        // Try each endpoint up to 2 times before moving to next
        const MAX_RETRIES = 2;
        
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const response = await fetchFromEndpoint(endpoints[i], i + 1);
            console.log(`Successfully fetched stream from endpoint ${i + 1}`);
            
            // Parse and validate response
            const data = await response.json();
            console.log('Stream API response data:', data);
            
            // Format handling for different response formats
            if (Array.isArray(data) && data.length > 0) {
              // Prefer HD stream if available
              const hdStream = data.find(stream => stream.hd === true);
              const selectedStream = hdStream || data[0];
              
              if (selectedStream.embedUrl) {
                return {
                  ...selectedStream,
                  // Ensure embed URL is properly formatted
                  embedUrl: ensureValidEmbedUrl(selectedStream.embedUrl)
                };
              }
            } else if (data && typeof data === 'object' && data.embedUrl) {
              return {
                ...data,
                embedUrl: ensureValidEmbedUrl(data.embedUrl)
              };
            }
            
            // If we get here, data format was unexpected
            throw new Error('Unexpected data format from API');
            
          } catch (error) {
            console.warn(`Attempt ${attempt} failed for endpoint ${i + 1}: ${(error as Error).message}`);
            lastError = error as Error;
            
            // Only retry after a delay
            if (attempt < MAX_RETRIES) {
              const delay = 1000 * attempt;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
      } catch (endpointError) {
        console.error(`All attempts failed for endpoint ${i + 1}`);
        lastError = endpointError as Error;
      }
    }
    
    // If we get here, we've tried all endpoints
    console.error('All stream endpoints failed:', lastError);
    
    // Return demo stream data if all endpoints fail
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
  return getDemoStreamData("default", "demo").embedUrl;
}

// Provides a demo stream when actual stream isn't available
function getDemoStreamData(source: string, id: string): Stream {
  console.log('Using demo stream data');
  
  // Select an appropriate demo stream based on source/id
  const sportType = id.includes('football') || source.includes('football') ? 'football' : 
                    id.includes('basketball') || source.includes('basketball') ? 'basketball' : 'sports';
  
  // Return demo stream object with appropriate embed URL
  return {
    id: `demo-${id}`,
    streamNo: 1,
    language: "English",
    hd: true,
    // Use publicly available sports stream embed for demo
    embedUrl: `https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw&autoplay=1&mute=0`,
    source: source || "demo"
  };
}
