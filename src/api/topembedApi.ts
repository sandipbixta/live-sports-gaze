import { Sport, Match, Stream } from '../types/sports';

const API_BASE = 'https://topembed.pw/api.php?format=json';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached data
const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

interface TopEmbedEvent {
  unix_timestamp: number;
  sport: string;
  tournament: string;
  match: string;
  channels: string[];
}

interface TopEmbedResponse {
  events: { [date: string]: TopEmbedEvent[] };
}

export const fetchTopEmbedData = async (): Promise<TopEmbedResponse | null> => {
  const cacheKey = 'topembed-data';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(API_BASE, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Failed to fetch TopEmbed data');
    const data = await response.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching TopEmbed data:', error);
    return null;
  }
};

export const convertTopEmbedToSports = async (): Promise<Sport[]> => {
  const data = await fetchTopEmbedData();
  if (!data || !data.events) return [];

  const sportsMap = new Map<string, Sport>();

  // Process all events to extract unique sports
  Object.values(data.events).flat().forEach((event: TopEmbedEvent) => {
    const sportName = event.sport;
    const sportId = sportName.toLowerCase().replace(/\s+/g, '-');
    
    if (!sportsMap.has(sportId)) {
      sportsMap.set(sportId, {
        id: sportId,
        name: sportName
      });
    }
  });

  return Array.from(sportsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const convertTopEmbedToMatches = async (sportId?: string): Promise<Match[]> => {
  const data = await fetchTopEmbedData();
  if (!data || !data.events) return [];

  const matches: Match[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Get events for today and upcoming days
  const relevantDates = Object.keys(data.events).filter(date => date >= today).slice(0, 7);

  relevantDates.forEach(date => {
    data.events[date].forEach((event: TopEmbedEvent, index: number) => {
      const eventSportId = event.sport.toLowerCase().replace(/\s+/g, '-');
      
      // Filter by sport if specified
      if (sportId && eventSportId !== sportId) return;

      const matchId = `topembed-${date}-${index}`;
      const startTime = new Date(event.unix_timestamp * 1000);
      
      // Parse team names from match string
      const teamsParts = event.match.split(' - ');
      const homeTeam = teamsParts[0]?.trim() || event.match;
      const awayTeam = teamsParts[1]?.trim() || '';

      const match: Match = {
        id: matchId,
        title: event.match,
        date: startTime.toISOString(),
        sportId: eventSportId,
        teams: {
          home: { name: homeTeam, logo: '' },
          away: { name: awayTeam, logo: '' }
        },
        sources: event.channels.map((channel, idx) => ({
          source: 'topembed',
          id: `${matchId}-${idx}`
        }))
      };

      matches.push(match);
    });
  });

  // Sort by date
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getTopEmbedStream = async (matchId: string, streamIndex: number = 0): Promise<Stream | null> => {
  // Get the raw TopEmbed data to find channel URLs
  const data = await fetchTopEmbedData();
  if (!data || !data.events) return null;

  // Find the match and get the channel URL
  let channelUrl: string | null = null;
  let channelIndex = streamIndex;
  
  // Parse match ID to extract date, event index, and channel index
  if (matchId.includes('topembed-')) {
    const matchIdParts = matchId.replace('topembed-', '').split('-');
    const date = `${matchIdParts[0]}-${matchIdParts[1]}-${matchIdParts[2]}`;
    const eventIndex = parseInt(matchIdParts[3]);
    
    // If the match ID has a channel index (like topembed-2025-07-31-176-2), use it
    if (matchIdParts.length > 4) {
      channelIndex = parseInt(matchIdParts[4]);
    }

    if (data.events[date] && data.events[date][eventIndex]) {
      const event = data.events[date][eventIndex];
      // Use the channel index from the match ID, fallback to streamIndex, then first channel
      channelUrl = event.channels[channelIndex] || event.channels[streamIndex] || event.channels[0];
      
      console.log(`TopEmbed stream for ${matchId}: channel ${channelIndex}, URL: ${channelUrl}`);
    }
  }

  if (!channelUrl) return null;
  
  return {
    id: `${matchId}-${channelIndex}`,
    streamNo: channelIndex + 1,
    language: 'en',
    hd: true,
    embedUrl: channelUrl,
    source: 'topembed'
  };
};