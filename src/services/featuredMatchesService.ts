const SPORTSDB_API_V1 = 'https://www.thesportsdb.com/api/v1/json/751945';
const SPORTSDB_API_V2 = 'https://www.thesportsdb.com/api/v2/json';
const API_KEY = '751945';
const WESTREAM_API = 'https://westream.su';

// ============================================
// POPULAR LEAGUES (High Priority)
// ============================================

const POPULAR_LEAGUES: Record<string, number> = {
  // Football - Top Tier (150+ points)
  'english premier league': 200,
  'premier league': 200,
  'uefa champions league': 200,
  'champions league': 200,
  'la liga': 180,
  'serie a': 170,
  'bundesliga': 170,
  'ligue 1': 150,
  'uefa europa league': 150,
  'europa league': 150,
  'uefa conference league': 130,
  'conference league': 130,
  'world cup': 250,
  'euro': 220,
  'copa america': 200,
  
  // Football - Second Tier (100-149)
  'fa cup': 130,
  'carabao cup': 100,
  'copa del rey': 120,
  'dfb pokal': 110,
  'coppa italia': 110,
  'coupe de france': 100,
  'eredivisie': 100,
  'primeira liga': 100,
  'scottish premiership': 80,
  'championship': 90,
  'mls': 80,
  
  // Basketball
  'nba': 200,
  'nba finals': 250,
  'nba playoffs': 220,
  'euroleague': 120,
  'ncaa': 150,
  'march madness': 200,
  
  // American Football
  'nfl': 200,
  'super bowl': 300,
  'nfl playoffs': 250,
  'college football': 120,
  'ncaaf': 120,
  
  // Hockey
  'nhl': 180,
  'stanley cup': 250,
  'nhl playoffs': 220,
  
  // Baseball
  'mlb': 150,
  'world series': 250,
  
  // Combat Sports
  'ufc': 200,
  'ufc ppv': 250,
  'bellator': 120,
  'boxing': 180,
  'wwe': 150,
  'aew': 120,
  
  // Motorsport
  'formula 1': 200,
  'f1': 200,
  'motogp': 150,
  'nascar': 130,
  'indycar': 100,
  
  // Tennis
  'wimbledon': 200,
  'us open': 180,
  'french open': 180,
  'australian open': 180,
  'atp': 120,
  'wta': 100,
  
  // Cricket
  'ipl': 180,
  'cricket world cup': 200,
  'the ashes': 180,
  
  // Rugby
  'six nations': 150,
  'rugby world cup': 200,
  
  // Australian Football
  'afl': 150,
  'afl finals': 200,
};

// ============================================
// POPULAR TEAMS (Bonus Points)
// ============================================

const POPULAR_TEAMS: string[] = [
  // Football
  'manchester united', 'manchester city', 'liverpool', 'arsenal', 'chelsea',
  'tottenham', 'real madrid', 'barcelona', 'atletico madrid', 'bayern munich',
  'borussia dortmund', 'psg', 'paris saint-germain', 'juventus', 'ac milan',
  'inter milan', 'napoli', 'roma', 'ajax', 'benfica', 'porto',
  
  // NBA
  'lakers', 'los angeles lakers', 'celtics', 'boston celtics', 'warriors',
  'golden state warriors', 'bulls', 'chicago bulls', 'heat', 'miami heat',
  'knicks', 'new york knicks', 'nets', 'brooklyn nets', 'bucks', 'suns',
  'mavericks', 'nuggets', 'clippers', '76ers', 'sixers',
  
  // NFL
  'chiefs', 'kansas city chiefs', 'eagles', 'philadelphia eagles',
  'cowboys', 'dallas cowboys', '49ers', 'san francisco 49ers',
  'bills', 'buffalo bills', 'ravens', 'patriots', 'packers', 'bears',
  
  // NHL
  'maple leafs', 'toronto maple leafs', 'canadiens', 'montreal canadiens',
  'bruins', 'boston bruins', 'rangers', 'new york rangers', 'penguins',
  'blackhawks', 'red wings', 'oilers', 'avalanche', 'lightning',
  
  // MLB
  'yankees', 'new york yankees', 'red sox', 'boston red sox',
  'dodgers', 'los angeles dodgers', 'cubs', 'chicago cubs',
  
  // UFC Fighters
  'conor mcgregor', 'jon jones', 'khabib', 'israel adesanya',
  'alex pereira', 'sean o\'malley', 'islam makhachev',
  
  // F1 Teams
  'red bull', 'ferrari', 'mercedes', 'mclaren',
];

// ============================================
// CALCULATE MATCH POPULARITY SCORE
// ============================================

const calculatePopularityScore = (match: any): number => {
  let score = 0;
  
  const title = (match.title || '').toLowerCase();
  const league = (match.league || match.competition || match.strLeague || title).toLowerCase();
  const homeTeam = (match.teams?.home?.name || match.strHomeTeam || '').toLowerCase();
  const awayTeam = (match.teams?.away?.name || match.strAwayTeam || '').toLowerCase();
  
  // League score
  for (const [leagueName, points] of Object.entries(POPULAR_LEAGUES)) {
    if (league.includes(leagueName) || title.includes(leagueName)) {
      score += points;
      break;
    }
  }
  
  // Team bonus (25 points per popular team)
  POPULAR_TEAMS.forEach(team => {
    if (homeTeam.includes(team) || team.includes(homeTeam)) score += 25;
    if (awayTeam.includes(team) || team.includes(awayTeam)) score += 25;
  });
  
  // Live bonus
  if (match.isLive || match.strProgress) {
    score += 100;
  }
  
  // Starting soon bonus (within 2 hours)
  const matchTime = match.date || (match.dateEvent ? new Date(`${match.dateEvent}T${match.strTime || '00:00'}`).getTime() : 0);
  if (matchTime) {
    const now = Date.now();
    const hoursUntil = (matchTime - now) / (1000 * 60 * 60);
    
    if (hoursUntil > 0 && hoursUntil <= 2) {
      score += 50; // Starting soon
    } else if (hoursUntil > 0 && hoursUntil <= 24) {
      score += 20; // Today
    }
  }
  
  return score;
};

// ============================================
// FETCH EVENT BANNER FROM THESPORTSDB
// ============================================

const fetchEventBanner = async (homeTeam: string, awayTeam: string): Promise<{
  banner: string | null;
  thumb: string | null;
  poster: string | null;
  homeBadge: string | null;
  awayBadge: string | null;
}> => {
  try {
    const eventName = `${homeTeam}_vs_${awayTeam}`.replace(/ /g, '_');
    const response = await fetch(
      `${SPORTSDB_API_V1}/searchevents.php?e=${encodeURIComponent(eventName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.event && data.event.length > 0) {
        const event = data.event[0];
        return {
          banner: event.strBanner || null,
          thumb: event.strThumb || null,
          poster: event.strPoster || null,
          homeBadge: event.strHomeTeamBadge || null,
          awayBadge: event.strAwayTeamBadge || null,
        };
      }
    }
  } catch (e) {
    // Ignore
  }
  
  return { banner: null, thumb: null, poster: null, homeBadge: null, awayBadge: null };
};

// ============================================
// FETCH TEAM BADGE & BANNER (Fallback)
// ============================================

const fetchTeamInfo = async (teamName: string): Promise<{ badge: string | null; banner: string | null }> => {
  if (!teamName) return { badge: null, banner: null };
  
  try {
    const response = await fetch(
      `${SPORTSDB_API_V1}/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        return {
          badge: team.strBadge || team.strLogo || null,
          banner: team.strBanner || team.strTeamFanart1 || team.strFanart1 || null,
        };
      }
    }
  } catch (e) {
    // Ignore
  }
  
  return { badge: null, banner: null };
};

// ============================================
// GET LIVE SCORES FROM THESPORTSDB V2
// ============================================

const getLivescoresFromSportsDB = async (): Promise<any[]> => {
  const sports = ['soccer', 'basketball', 'hockey', 'nfl', 'baseball', 'fighting'];
  const allLive: any[] = [];
  
  await Promise.all(sports.map(async (sport) => {
    try {
      const response = await fetch(
        `${SPORTSDB_API_V2}/livescore/${sport}`,
        {
          headers: { 'X-API-KEY': API_KEY },
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const matches = data.livescore || [];
        matches.forEach((m: any) => {
          m.isLive = true;
          m.sport = sport;
        });
        allLive.push(...matches);
      }
    } catch (e) {
      console.warn(`Failed to get ${sport} livescores`);
    }
  }));
  
  return allLive;
};

// ============================================
// GET MATCHES FROM WESTREAM
// ============================================

const getWeStreamMatches = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${WESTREAM_API}/matches`, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.warn('Failed to get WeStream matches');
  }
  
  return [];
};

// ============================================
// MAIN: GET FEATURED MATCHES FOR CAROUSEL
// ============================================

export const getFeaturedMatches = async (limit: number = 8): Promise<any[]> => {
  try {
    // 1. Get live matches from TheSportsDB
    const liveMatches = await getLivescoresFromSportsDB();
    
    // 2. Get matches from WeStream
    const weStreamMatches = await getWeStreamMatches();
    
    // 3. Combine and deduplicate
    const allMatches = [...liveMatches, ...weStreamMatches];
    
    // 4. Calculate popularity scores
    const scoredMatches = allMatches.map(match => ({
      ...match,
      _popularityScore: calculatePopularityScore(match)
    }));
    
    // 5. Filter only popular matches (score > 80)
    const popularMatches = scoredMatches.filter(m => m._popularityScore >= 80);
    
    // 6. Sort by popularity (highest first)
    popularMatches.sort((a, b) => b._popularityScore - a._popularityScore);
    
    // 7. Take top matches
    const topMatches = popularMatches.slice(0, limit * 2); // Get extra to filter by banner
    
    // 8. Fetch banners for top matches (in parallel batches)
    const matchesWithBanners: any[] = [];
    
    // Process in batches of 4 for rate limiting
    for (let i = 0; i < topMatches.length && matchesWithBanners.length < limit; i += 4) {
      const batch = topMatches.slice(i, i + 4);
      
      const results = await Promise.all(batch.map(async (match) => {
        const homeTeam = match.teams?.home?.name || match.strHomeTeam || '';
        const awayTeam = match.teams?.away?.name || match.strAwayTeam || '';
        
        // Skip if already has banner
        if (match.strBanner || match.strThumb || match.banner) {
          return {
            ...match,
            banner: match.strBanner || match.strThumb || match.banner,
            homeTeam,
            awayTeam,
            homeBadge: match.strHomeTeamBadge || match.teams?.home?.badge,
            awayBadge: match.strAwayTeamBadge || match.teams?.away?.badge,
          };
        }
        
        // Fetch event banner and team info in parallel
        const [eventImages, homeInfo, awayInfo] = await Promise.all([
          fetchEventBanner(homeTeam, awayTeam),
          fetchTeamInfo(homeTeam),
          fetchTeamInfo(awayTeam),
        ]);
        
        const banner = eventImages.banner || eventImages.thumb || eventImages.poster || homeInfo.banner;
        
        if (banner) {
          return {
            ...match,
            banner,
            homeTeam,
            awayTeam,
            homeBadge: eventImages.homeBadge || homeInfo.badge || match.teams?.home?.badge,
            awayBadge: eventImages.awayBadge || awayInfo.badge || match.teams?.away?.badge,
          };
        }
        
        return null;
      }));
      
      matchesWithBanners.push(...results.filter(Boolean));
    }
    
    console.log(`🎬 Featured: ${matchesWithBanners.length} matches with banners`);
    return matchesWithBanners.slice(0, limit);
  } catch (error) {
    console.error('Failed to get featured matches:', error);
    return [];
  }
};

// ============================================
// GET UPCOMING EVENTS FROM THESPORTSDB
// ============================================

export const getUpcomingEvents = async (leagueId: number): Promise<any[]> => {
  try {
    const response = await fetch(
      `${SPORTSDB_API_V1}/eventsnextleague.php?id=${leagueId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.events || [];
    }
  } catch (e) {
    console.warn('Failed to get upcoming events');
  }
  
  return [];
};
