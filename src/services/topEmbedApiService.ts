export interface TopEmbedMatch {
  unix_timestamp: number;
  sport: string;
  tournament: string;
  match: string;
  channels: string[];
}

export interface TopEmbedApiResponse {
  events: {
    [date: string]: TopEmbedMatch[];
  };
}

export interface ProcessedTopEmbedMatch {
  id: string;
  title: string;
  teams: {
    home: string;
    away: string;
  };
  date: number;
  tournament: string;
  sport: string;
  channels: string[];
  poster?: string;
}

const LEAGUE_POSTERS: Record<string, string> = {
  'Premier League': 'https://i.imgur.com/o7RM64a.png',
  'La Liga': 'https://i.imgur.com/zDPJimE.png',
  'Bundesliga': 'https://i.imgur.com/6TQSAkc.png',
  'Serie A': 'https://i.imgur.com/rleosju.png',
  'Ligue 1': 'https://i.imgur.com/jN6tCKs.png',
};

const TARGET_LEAGUES = [
  'Premier League',
  'La Liga', 
  'Bundesliga',
  'Serie A',
  'Ligue 1'
];

export const fetchTopEmbedMatches = async (): Promise<ProcessedTopEmbedMatch[]> => {
  try {
    const response = await fetch('https://topembed.pw/api.php?format=json');
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }
    
    const data: TopEmbedApiResponse = await response.json();
    const processedMatches: ProcessedTopEmbedMatch[] = [];
    
    // Process all events for all dates
    Object.entries(data.events).forEach(([date, matches]) => {
      matches.forEach((match) => {
        // Only include football matches from target leagues
        if (match.sport === 'Football' && TARGET_LEAGUES.includes(match.tournament)) {
          // Parse team names from match string (format: "Team A - Team B")
          const teamParts = match.match.split(' - ');
          const home = teamParts[0]?.trim() || 'TBD';
          const away = teamParts[1]?.trim() || 'TBD';
          
          const processedMatch: ProcessedTopEmbedMatch = {
            id: `topembed_${match.unix_timestamp}_${match.tournament.replace(/\s+/g, '_')}`,
            title: match.match,
            teams: { home, away },
            date: match.unix_timestamp * 1000, // Convert to milliseconds
            tournament: match.tournament,
            sport: match.sport,
            channels: match.channels,
            poster: LEAGUE_POSTERS[match.tournament]
          };
          
          processedMatches.push(processedMatch);
        }
      });
    });
    
    // Sort by date (most recent first)
    return processedMatches.sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Error fetching TopEmbed matches:', error);
    return [];
  }
};

export const isTopEmbedMatchLive = (match: ProcessedTopEmbedMatch): boolean => {
  const now = Date.now();
  const matchTime = match.date;
  const timeDiff = now - matchTime;
  
  // Consider match live if it started within the last 2 hours and hasn't ended (assume 2 hour duration)
  return timeDiff >= 0 && timeDiff <= 2 * 60 * 60 * 1000;
};