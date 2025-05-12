
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

export const fetchStream = async (source: string, id: string): Promise<Stream> => {
  try {
    const response = await fetch(`${API_BASE}/stream/${source}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch stream');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stream:', error);
    return {};
  }
};
