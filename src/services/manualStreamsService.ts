
import { Match } from '../types/sports';

export interface ManualStream extends Match {
  embedUrl: string;
}

export const fetchManualStreams = async (): Promise<ManualStream[]> => {
  try {
    const response = await fetch('/manual-streams.json');
    if (!response.ok) {
      console.log('No manual streams configuration found');
      return [];
    }
    
    const data = await response.json();
    return data.streams || [];
  } catch (error) {
    console.error('Error loading manual streams:', error);
    return [];
  }
};
