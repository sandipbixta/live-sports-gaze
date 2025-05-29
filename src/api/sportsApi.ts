
import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://streamed.su/api';

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
    
    console.log('fetchMatches - Raw API response:', matches);
    
    return matches.map((match: Match) => {
      console.log(`Match ${match.id} has ${match.sources?.length || 0} sources:`, match.sources);
      return match;
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

export const fetchMatch = async (sportId: string, matchId: string): Promise<Match> => {
  try {
    const matches = await fetchMatches(sportId);
    const match = matches.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');
    
    console.log(`fetchMatch - Found match with ${match.sources?.length || 0} sources:`, match.sources);
    
    return match;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
};

export const fetchStream = async (source: string, id: string): Promise<Stream | Stream[]> => {
  try {
    console.log(`Fetching stream: ${API_BASE}/stream/${source}/${id}`);
    
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      mode: 'cors',
    });
    
    if (!response.ok) {
      console.error(`Stream API error: ${response.status}`);
      throw new Error(`Failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Stream API response:', data);
    
    // Handle array of streams
    if (Array.isArray(data)) {
      return data.map((stream, index) => ({
        id: `${source}-${id}-${stream.language || index}-${Date.now()}`,
        streamNo: stream.streamNo || index + 1,
        language: stream.language || `Stream ${index + 1}`,
        hd: stream.hd || false,
        embedUrl: stream.embedUrl || '',
        source: source
      }));
    }
    
    // Handle single stream object
    if (data && data.embedUrl) {
      return {
        id: `${source}-${id}-${Date.now()}`,
        streamNo: data.streamNo || 1,
        language: data.language || 'Default',
        hd: data.hd || false,
        embedUrl: data.embedUrl,
        source: source
      };
    }
    
    // If embedUrl is missing, throw error
    throw new Error('No valid stream URL found');
    
  } catch (error) {
    console.error('Error fetching stream:', error);
    
    // Return a working demo stream as fallback
    return {
      id: `demo-${source}-${id}-${Date.now()}`,
      streamNo: 1,
      language: 'Demo Stream',
      hd: false,
      embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1',
      source: source
    };
  }
};
