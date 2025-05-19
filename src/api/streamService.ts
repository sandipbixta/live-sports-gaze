
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
      const fallbackResponse = await fetch(`${FALLBACK_API_BASE}/stream/${source}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        }, 
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
    // Return a demo stream with embedded video for fallback
    return getFallbackStreamData(source, id);
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
    
    // If data structure is unexpected, throw error
    throw new Error('Unexpected stream data format');
  } catch (innerError) {
    console.error('Error processing stream data:', innerError);
    // Return fallback stream for troubleshooting
    return getFallbackStreamData(source, id);
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
  // This is a fallback mechanism when API doesn't provide embedUrl
  const sourceToEmbed: Record<string, string> = {
    'alpha': `https://embedstream.me/stream/${id}`,
    'bravo': `https://embedder.live/e/${id}`,
    'charlie': `https://weblivehdplay.ru/p/frame.html?id=${id}`,
    'delta': `https://www.techoreels.com/embed/${id}`,
    // Add more sources as needed
  };
  
  return sourceToEmbed[source] || 
    // Default fallback to a known working stream (for demo/testing)
    "https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw&autoplay=1";
}

// Fallback stream data with reliable embed source
function getFallbackStreamData(source: string, id: string): Stream {
  console.log('Using fallback stream data for source:', source, 'id:', id);
  
  // Try to use a source-specific fallback if available
  const fallbackUrl = constructEmbedUrl(source, id);
  
  return {
    id: `${source}-${id}`,
    streamNo: 1,
    language: "English",
    hd: true,
    embedUrl: fallbackUrl,
    source: source
  };
}
