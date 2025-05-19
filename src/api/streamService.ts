
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
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store', // Always get fresh content
    });
    
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
    // Return a demo stream with basic embed for troubleshooting
    return getDemoStreamData(source, id);
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

// Ensure URL is valid and has proper protocol
function ensureValidUrl(url: string): string {
  if (!url) return '';
  
  // Check if URL already has protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
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
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCb3c6rB0Ru1i9jmbyj6f7uw",
    source: source || "demo"
  };
}
