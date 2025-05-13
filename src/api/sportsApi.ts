
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
    return await response.json();
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

export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    console.log(`Fetching stream from: ${API_BASE}/stream/${source}/${id}`);
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`);
    
    if (!response.ok) throw new Error('Failed to fetch stream');
    
    const data = await response.json();
    console.log('Stream data:', data);
    
    // The API returns an array of stream options
    if (Array.isArray(data) && data.length > 0) {
      // Prefer HD stream if available
      const hdStream = data.find(stream => stream.hd === true);
      return hdStream || data[0];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching stream:', error);
    return {};
  }
};
