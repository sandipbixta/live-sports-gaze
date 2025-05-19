
import { StreamsApiResponse, StreamInfo } from './types';
import { Match } from '../types/sports';
import { STREAMS_API, REQUEST_TIMEOUT } from './constants';

/**
 * Fetches all available streams from the streams API endpoint
 * Response includes categorized streams with detailed information
 * @returns Promise with StreamsApiResponse containing all stream categories and their streams
 */
export const fetchStreamsApi = async (): Promise<StreamsApiResponse> => {
  try {
    console.log('Fetching streams from API:', STREAMS_API);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
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
    }),
    // Add poster image from stream info
    poster: streamInfo.poster
  };
};
