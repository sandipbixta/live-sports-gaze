const WESTREAM_API = 'https://westream.su';
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/3';

// League importance scores for ranking
const LEAGUE_SCORES: Record<string, number> = {
  // Football - Top Leagues
  'premier league': 100,
  'la liga': 100,
  'serie a': 95,
  'bundesliga': 95,
  'ligue 1': 90,
  'champions league': 150,
  'europa league': 120,
  'world cup': 200,
  'euro': 180,
  'copa america': 150,
  
  // US Sports
  'nba': 100,
  'nfl': 120,
  'mlb': 80,
  'nhl': 80,
  'mls': 60,
  
  // Other Football
  'eredivisie': 70,
  'primeira liga': 70,
  'scottish': 50,
  'championship': 60,
  
  // Default
  'default': 30
};

// Popular teams get bonus points
const POPULAR_TEAMS = [
  'manchester united', 'manchester city', 'liverpool', 'arsenal', 'chelsea',
  'real madrid', 'barcelona', 'atletico madrid', 'bayern munich', 'borussia dortmund',
  'psg', 'paris saint-germain', 'juventus', 'ac milan', 'inter milan',
  'lakers', 'warriors', 'celtics', 'bulls', 'heat', 'knicks',
  'chiefs', 'cowboys', 'patriots', '49ers', 'eagles',
  'yankees', 'dodgers', 'red sox'
];

// Calculate match importance score
const calculateMatchScore = (match: any): number => {
  let score = LEAGUE_SCORES['default'];
  
  // Check league
  const league = (match.league || match.competition || match.title || '').toLowerCase();
  for (const [key, value] of Object.entries(LEAGUE_SCORES)) {
    if (league.includes(key)) {
      score = value;
      break;
    }
  }
  
  // Bonus for popular teams
  const homeTeam = (match.teams?.home?.name || '').toLowerCase();
  const awayTeam = (match.teams?.away?.name || '').toLowerCase();
  
  POPULAR_TEAMS.forEach(team => {
    if (homeTeam.includes(team) || awayTeam.includes(team)) {
      score += 25;
    }
  });
  
  // Bonus if match is live
  if (match.isLive || match.status === 'live') {
    score += 50;
  }
  
  // Bonus if starting soon (within 30 min)
  if (match.date) {
    const matchTime = new Date(match.date).getTime();
    const now = Date.now();
    const diffMinutes = (matchTime - now) / (1000 * 60);
    if (diffMinutes > 0 && diffMinutes <= 30) {
      score += 30;
    }
  }
  
  return score;
};

// Fetch event image from TheSportsDB
const fetchEventImage = async (homeTeam: string, awayTeam: string): Promise<string | null> => {
  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
    const response = await fetch(
      `${SPORTSDB_API}/searchevents.php?e=${encodeURIComponent(eventName)}`
    );
    const data = await response.json();
    
    if (data.event && data.event.length > 0) {
      return data.event[0].strThumb || data.event[0].strBanner || data.event[0].strPoster || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch event image:', error);
    return null;
  }
};

// Fetch team badge from TheSportsDB
const fetchTeamBadge = async (teamName: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`
    );
    const data = await response.json();
    
    if (data.teams && data.teams.length > 0) {
      return data.teams[0].strBadge || data.teams[0].strLogo || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Main function to get featured matches for carousel
export const getFeaturedMatches = async (limit: number = 6): Promise<any[]> => {
  try {
    // 1. Fetch all matches from WeStream
    const response = await fetch(`${WESTREAM_API}/matches`);
    const matches = await response.json();
    
    if (!Array.isArray(matches) || matches.length === 0) {
      return [];
    }
    
    // 2. Score and sort matches
    const scoredMatches = matches.map(match => ({
      ...match,
      _score: calculateMatchScore(match)
    }));
    
    scoredMatches.sort((a, b) => b._score - a._score);
    
    // 3. Take top matches
    const topMatches = scoredMatches.slice(0, limit);
    
    // 4. Enhance with TheSportsDB images (parallel)
    const enhancedMatches = await Promise.all(
      topMatches.map(async (match) => {
        const homeTeam = match.teams?.home?.name || '';
        const awayTeam = match.teams?.away?.name || '';
        
        // Fetch event image and team badges in parallel
        const [eventImage, homeBadge, awayBadge] = await Promise.all([
          fetchEventImage(homeTeam, awayTeam),
          fetchTeamBadge(homeTeam),
          fetchTeamBadge(awayTeam)
        ]);
        
        return {
          ...match,
          poster: eventImage,
          teams: {
            home: {
              ...match.teams?.home,
              badge: homeBadge || match.teams?.home?.badge
            },
            away: {
              ...match.teams?.away,
              badge: awayBadge || match.teams?.away?.badge
            }
          }
        };
      })
    );
    
    return enhancedMatches;
  } catch (error) {
    console.error('Failed to fetch featured matches:', error);
    return [];
  }
};
