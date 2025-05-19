
import { StreamInfo, StreamCategory, fetchStreamsApi, convertStreamInfoToMatch } from "../api/sportsApi";
import { Match } from "../types/sports";

/**
 * Fetches all streams and converts them to Match objects
 * @returns Promise with an array of Match objects
 */
export const fetchAllStreamMatches = async (): Promise<Match[]> => {
  try {
    const streamsData = await fetchStreamsApi();
    if (!streamsData.success) {
      return [];
    }
    
    // Flatten all streams from all categories into a single array of Match objects
    const matches: Match[] = [];
    
    streamsData.streams.forEach(category => {
      category.streams.forEach(stream => {
        // Only include streams that are live now or will be live in the future
        const now = Math.floor(Date.now() / 1000);
        if (stream.always_live === 1 || stream.starts_at >= now) {
          matches.push(convertStreamInfoToMatch(stream));
        }
      });
    });
    
    return matches;
  } catch (error) {
    console.error('Error fetching stream matches:', error);
    return [];
  }
};

/**
 * Checks if a stream is currently live based on its time data
 * @param stream StreamInfo object to check
 * @returns boolean indicating if the stream is currently live
 */
export const isStreamLive = (stream: StreamInfo): boolean => {
  if (stream.always_live === 1) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return stream.starts_at <= now && stream.ends_at >= now;
};

/**
 * Groups streams by their categories
 * @returns Promise with a record of category names to Match arrays
 */
export const fetchStreamsByCategory = async (): Promise<Record<string, Match[]>> => {
  try {
    const streamsData = await fetchStreamsApi();
    if (!streamsData.success) {
      return {};
    }
    
    const streamsByCategory: Record<string, Match[]> = {};
    
    streamsData.streams.forEach(category => {
      const categoryName = category.category.toLowerCase();
      streamsByCategory[categoryName] = category.streams
        .filter(stream => stream.always_live === 1 || stream.starts_at >= Math.floor(Date.now() / 1000))
        .map(stream => convertStreamInfoToMatch(stream));
    });
    
    return streamsByCategory;
  } catch (error) {
    console.error('Error fetching streams by category:', error);
    return {};
  }
};

/**
 * Formats a Unix timestamp to a human-readable date/time string
 * @param timestamp Unix timestamp (seconds since epoch)
 * @returns Formatted date/time string
 */
export const formatStreamTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', { 
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

