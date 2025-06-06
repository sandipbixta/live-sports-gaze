
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
    
    // Return all sources without filtering to show different languages
    return matches;
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

export const fetchStream = async (source: string, id: string, streamNo?: number): Promise<Stream | Stream[]> => {
  try {
    // More detailed logging
    console.log(`Fetching stream data: source=${source}, id=${id}, streamNo=${streamNo}`);
    
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
              // If a specific streamNo is requested, return that stream
              if (streamNo !== undefined) {
                const specificStream = data.find(stream => stream.streamNo === streamNo);
                if (specificStream && isValidStreamUrl(specificStream.embedUrl)) {
                  return {
                    ...specificStream,
                    embedUrl: ensureValidEmbedUrl(specificStream.embedUrl)
                  };
                }
              }
              
              // Return all streams if no specific streamNo requested
              return data
                .filter(stream => isValidStreamUrl(stream.embedUrl))
                .map(stream => ({
                  ...stream,
                  embedUrl: ensureValidEmbedUrl(stream.embedUrl)
                }));
            } else if (data && typeof data === 'object' && data.embedUrl) {
              if (isValidStreamUrl(data.embedUrl)) {
                return {
                  ...data,
                  embedUrl: ensureValidEmbedUrl(data.embedUrl)
                };
              }
            }
            
            // If we get here, no valid streams found
            throw new Error('No valid streams found in API response');
            
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
    throw new Error('No valid streams available from API');
    
  } catch (error) {
    console.error('Error in fetchStream:', error);
    throw error;
  }
};

// Helper function to check if URL is a valid stream (not demo/YouTube)
function isValidStreamUrl(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  
  // Reject YouTube and demo URLs
  const invalidDomains = [
    'youtube.com',
    'youtu.be',
    'demo',
    'example.com'
  ];
  
  return !invalidDomains.some(domain => url.includes(domain));
}

// Helper function to ensure embed URL is valid
function ensureValidEmbedUrl(url: string): string {
  // Return the provided URL if it seems valid and not a demo
  if (url && url.startsWith('http') && isValidStreamUrl(url)) {
    return url;
  }
  
  // If URL is invalid, throw error instead of returning demo
  throw new Error('Invalid or demo stream URL provided');
}
