
import { Stream } from '../types/sports';
import { API_BASE, FALLBACK_API_BASE, STREAM_API, REQUEST_TIMEOUT, PROXY_STREAM_API } from './constants';

/**
 * Fetches stream data for a specific source and ID
 */
export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    // More detailed logging for debugging
    console.log(`Attempting to fetch stream: source=${source}, id=${id}`);
    
    // Define direct URL for better reliability
    const endpoint = `${STREAM_API}/${source}/${id}`;
    console.log(`Stream endpoint: ${endpoint}`);
    
    // Make the request with additional options for better reliability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store', // Always get fresh content
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is successful
      if (!response.ok) {
        console.error(`API responded with status ${response.status}`);
        throw new Error(`API responded with status ${response.status}`);
      }
      
      // Parse response
      const data = await response.json();
      console.log('Stream API response:', data);
      
      // Process the stream data
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
        console.error(`Proxy API responded with status ${proxyResponse.status}`);
        throw new Error(`Proxy API responded with status ${proxyResponse.status}`);
      }
      
      const proxyData = await proxyResponse.json();
      console.log('Proxy API response:', proxyData);
      return processStreamData(proxyData, source, id);
    }
    
  } catch (error) {
    console.error('Error in fetchStream:', error);
    
    // Try fallback API as last resort
    try {
      console.log('Trying fallback API endpoint...');
      const fallbackEndpoint = `${FALLBACK_API_BASE}/stream/${source}/${id}`;
      
      const fallbackResponse = await fetch(fallbackEndpoint, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store'
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API failed with status ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('Fallback API response:', fallbackData);
      return processStreamData(fallbackData, source, id);
      
    } catch (fallbackError) {
      console.error('All API attempts failed:', fallbackError);
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
  }
};

// Helper function to process different stream data formats with improved reliability
function processStreamData(data: any, source: string, id: string): Stream {
  try {
    // Check for empty or null data
    if (!data) {
      console.error('Stream data is empty or null');
      throw new Error('Empty stream data received');
    }
    
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
      
      // If embedUrl is directly in the response
      if (data.embedUrl) {
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
      // If iframe or similar properties contain the embed URL
      else if (data.iframe) {
        const embedUrl = cleanEmbedUrl(data.iframe);
        return {
          id: data.id || `${source}-${id}`,
          streamNo: data.streamNo || 1,
          language: data.language || "English",
          hd: data.hd || true,
          embedUrl: embedUrl,
          source: source
        };
      }
      // If data is in a different format, try to extract embed URL from various properties
      else {
        // Look for any property that might contain a URL
        const possibleUrlProps = ['url', 'src', 'embed', 'player', 'link'];
        for (const prop of possibleUrlProps) {
          if (data[prop] && typeof data[prop] === 'string') {
            const embedUrl = cleanEmbedUrl(data[prop]);
            return {
              id: data.id || `${source}-${id}`,
              streamNo: data.streamNo || 1,
              language: data.language || "English",
              hd: data.hd || true,
              embedUrl: embedUrl,
              source: source
            };
          }
        }
      }
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
  
  console.log('Cleaning embed URL:', url);
  
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

  // Handle direct embed URLs
  if (cleanUrl.includes('/embed/') && !cleanUrl.startsWith('http')) {
    cleanUrl = `https://${cleanUrl}`;
  }
  
  // Add parameters needed for autoplay
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    // Ensure proper YouTube embed parameters
    if (!cleanUrl.includes('autoplay=')) {
      cleanUrl += cleanUrl.includes('?') ? '&autoplay=1' : '?autoplay=1';
    }
    if (!cleanUrl.includes('origin=')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      cleanUrl += `&origin=${encodeURIComponent(origin)}`;
    }
  } else {
    // Add autoplay parameter for non-YouTube URLs
    if (!cleanUrl.includes('autoplay=')) {
      cleanUrl += cleanUrl.includes('?') ? '&autoplay=1' : '?autoplay=1';
    }
  }
  
  console.log('Cleaned embed URL:', cleanUrl);
  return cleanUrl;
}
