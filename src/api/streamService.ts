
import { Stream } from '../types/sports';
import { API_BASE, FALLBACK_API_BASE, STREAM_API, REQUEST_TIMEOUT, PROXY_STREAM_API } from './constants';

/**
 * Fetches stream data for a specific source and ID
 */
export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    // More detailed logging for debugging
    console.log(`Attempting to fetch stream: source=${source}, id=${id}`);
    
    // Define the API endpoint for stream data
    const endpoint = `${STREAM_API}/${source}/${id}`;
    console.log(`Stream endpoint: ${endpoint}`);
    
    // Make the request with additional headers for troubleshooting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
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
        throw new Error(`API responded with status ${response.status}`);
      }
      
      // Parse response and validate the data structure
      const data = await response.json();
      console.log('Stream API response:', data);
      
      // Process the stream data based on its format
      return processStreamData(data, source, id);
      
    } catch (initialError) {
      console.error('Initial API request failed:', initialError);
      
      // Try direct proxy approach
      console.log('Trying proxy stream API endpoint...');
      const proxyEndpoint = `${PROXY_STREAM_API}/${source}/${id}`;
      console.log(`Proxy endpoint: ${proxyEndpoint}`);
      
      const proxyResponse = await fetch(proxyEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store'
      });
      
      if (!proxyResponse.ok) {
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
          throw new Error(`All API attempts failed`);
        }
        
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback API response:', fallbackData);
        return processStreamData(fallbackData, source, id);
      }
      
      const proxyData = await proxyResponse.json();
      console.log('Proxy API response:', proxyData);
      return processStreamData(proxyData, source, id);
    }
    
  } catch (error) {
    console.error('Error in fetchStream:', error);
    
    // Provide a default stream object with an error flag
    return {
      id: `error-${source}-${id}`,
      streamNo: 0,
      language: "unknown",
      hd: false,
      embedUrl: "",
      source: source,
      error: true
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
      
      // Validate and clean up the embedUrl
      if (!hdStream.embedUrl) {
        console.warn('Stream data missing embedUrl');
        throw new Error('Stream data missing embedUrl');
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
      if (!data.embedUrl) {
        throw new Error('Stream data missing embedUrl');
      }
      const embedUrl = cleanEmbedUrl(data.embedUrl);
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
    throw new Error('Invalid stream data format received');
  } catch (innerError) {
    console.error('Error processing stream data:', innerError);
    throw innerError;
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

  // Handle direct embed URLs that might be missing the protocol
  if (cleanUrl.includes('/embed/') && !cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`;
  }
  
  return cleanUrl;
}
