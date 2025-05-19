
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
export function generateCrossBrowserUrl(url: string): string {
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
