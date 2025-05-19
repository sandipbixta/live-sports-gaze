
import { Stream } from '../types/sports';
import { API_BASE, FALLBACK_API_BASE, REQUEST_TIMEOUT } from './constants';

/**
 * Fetches stream data for a specific source and ID
 */
export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    // More detailed logging for debugging
    console.log(`Attempting to fetch stream: source=${source}, id=${id}`);
    
    // Define the API endpoint for stream data
    const endpoint = `${API_BASE}/stream/${source}/${id}`;
    console.log(`Stream endpoint: ${endpoint}`);
    
    // Make the request with additional headers for troubleshooting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store', // Always get fresh content
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is successful
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`Stream API error (${response.status}): ${errorText}`);
      
      // Try fallback API if main API fails
      console.log('Trying fallback API endpoint...');
      const fallbackEndpoint = `${FALLBACK_API_BASE}/stream/${source}/${id}`;
      console.log(`Fallback endpoint: ${fallbackEndpoint}`);
      
      const fallbackResponse = await fetch(fallbackEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        }, 
        cache: 'no-store',
      });
      
      if (!fallbackResponse.ok) {
        console.error(`Fallback API also failed with status ${fallbackResponse.status}`);
        // Instead of throwing, return direct stream data if we can construct it
        const directStream = getDirectStreamData(source, id);
        if (directStream.embedUrl) {
          return directStream;
        }
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
    // Return a direct stream with embedded video for fallback
    return getDirectStreamData(source, id);
  }
};

// Helper function to process different stream data formats
function processStreamData(data: any, source: string, id: string): Stream {
  try {
    // Handle array response format
    if (Array.isArray(data) && data.length > 0) {
      // Find HD stream if available, otherwise take the first one
      const hdStream = data.find(stream => stream.hd === true) || data[0];
      
      // Validate and clean up the embedUrl
      if (!hdStream.embedUrl) {
        console.warn('Stream data missing embedUrl, attempting to construct one');
        // Attempt to construct a valid embedUrl if missing
        hdStream.embedUrl = constructEmbedUrl(source, id);
      } else {
        hdStream.embedUrl = cleanEmbedUrl(hdStream.embedUrl);
      }
      
      console.log('Using stream data:', hdStream);
      return {
        ...hdStream,
        source: source
      };
    } 
    // Handle object response format
    else if (data && typeof data === 'object') {
      console.log('Using single object stream data');
      const embedUrl = data.embedUrl ? cleanEmbedUrl(data.embedUrl) : constructEmbedUrl(source, id);
      return {
        id: data.id || `${source}-${id}`,
        streamNo: data.streamNo || 1,
        language: data.language || "English",
        hd: data.hd || true,
        embedUrl: embedUrl,
        source: source
      };
    }
    
    // If data structure is unexpected, use direct URL
    return getDirectStreamData(source, id);
  } catch (innerError) {
    console.error('Error processing stream data:', innerError);
    // Return direct stream for troubleshooting
    return getDirectStreamData(source, id);
  }
}

// Clean up embed URL and ensure it's valid
function cleanEmbedUrl(url: string): string {
  if (!url) return '';
  
  // Fix common URL issues
  let cleanUrl = url
    .replace(/&amp;/g, '&')  // Fix encoded ampersands
    .replace(/^\s+|\s+$/g, ''); // Trim whitespace
  
  // Ensure URL has proper protocol
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    if (cleanUrl.startsWith('//')) {
      cleanUrl = `https:${cleanUrl}`;
    } else {
      cleanUrl = `https://${cleanUrl}`;
    }
  }
  
  return cleanUrl;
}

// Attempt to construct a valid embed URL when none is provided
function constructEmbedUrl(source: string, id: string): string {
  // Check if we can use the streamed.su API directly for embedding
  const streamedSuEmbed = `https://streamed.su/embed/${source}/${id}`;
  
  // This is a fallback mechanism when API doesn't provide embedUrl
  const sourceToEmbed: Record<string, string> = {
    'alpha': `https://embedstream.me/stream/${id}`,
    'bravo': `https://embedder.live/e/${id}`,
    'charlie': `https://weblivehdplay.ru/p/frame.html?id=${id}`,
    'delta': `https://www.techoreels.com/embed/${id}`,
    // Use streamed.su as the default for all sources
    'default': streamedSuEmbed
  };
  
  return sourceToEmbed[source] || sourceToEmbed['default'];
}

// Get direct stream data using known patterns for stream URLs
function getDirectStreamData(source: string, id: string): Stream {
  console.log('Using direct stream data for source:', source, 'id:', id);
  
  // First try to use streamed.su direct embed
  const streamedSuEmbed = `https://streamed.su/embed/${source}/${id}`;
  
  return {
    id: `${source}-${id}`,
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: streamedSuEmbed,
    source: source
  };
}
