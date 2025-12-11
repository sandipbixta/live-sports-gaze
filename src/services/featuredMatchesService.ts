const SPORTSDB_API_V1 = 'https://www.thesportsdb.com/api/v1/json/751945';
const WESTREAM_API = 'https://westream.su';

// ============================================
// LEAGUE IDS FOR DIRECT FETCHING
// ============================================

const POPULAR_LEAGUE_IDS = {
  'UEFA Europa League': 4481,
  'UEFA Champions League': 4480,
  'UEFA Conference League': 5071,
  'English Premier League': 4328,
  'La Liga': 4335,
  'Serie A': 4332,
  'Bundesliga': 4331,
  'Ligue 1': 4334,
  'NBA': 4387,
  'NHL': 4380,
  'NFL': 4391,
};

// ============================================
// POPULAR LEAGUES (High Priority)
// ============================================

const POPULAR_LEAGUES: Record<string, number> = {
  // Football - Top Tier (BOOSTED Europa/Conference)
  'uefa europa league': 250,
  'europa league': 250,
  'uefa conference league': 220,
  'conference league': 220,
  'uefa champions league': 280,
  'champions league': 280,
  'english premier league': 200,
  'premier league': 200,
  'la liga': 180,
  'serie a': 170,
  'bundesliga': 170,
  'ligue 1': 150,
  'world cup': 300,
  'euro': 280,
  'copa america': 250,
  'fa cup': 130,
  'copa del rey': 120,
  'mls': 80,
  
  // Basketball
  'nba': 150, // Lowered to let football show
  'euroleague': 120,
  
  // Hockey
  'nhl': 140, // Lowered
  
  // American Football
  'nfl': 180,
  'super bowl': 300,
  
  // Combat Sports
  'ufc': 200,
  'boxing': 180,
  'wwe': 150,
};

// ============================================
// TEAM NAME CORRECTIONS (WeStream -> TheSportsDB)
// ============================================

const TEAM_NAME_CORRECTIONS: Record<string, string> = {
  // Europa/Conference League teams
  'ferencvarosi tc': 'Ferencvaros',
  'ferencvaros tc': 'Ferencvaros',
  'rangers': 'Rangers',
  'slovan bratislava': 'Slovan Bratislava',
  'sparta praha': 'Sparta Prague',
  'universitatea craiova': 'CS Universitatea Craiova',
  'az alkmaar': 'AZ Alkmaar',
  'vfb stuttgart': 'Stuttgart',
  'maccabi tel aviv': 'Maccabi Tel Aviv',
  'legia warszawa': 'Legia Warsaw',
  'fc noah': 'Noah FC',
  'breidablik': 'Breidablik',
  'shamrock rovers': 'Shamrock Rovers',
  'shkendija': 'Shkendija',
  'drita': 'Drita',
  
  // NBA
  'los angeles lakers': 'Los Angeles Lakers',
  'san antonio spurs': 'San Antonio Spurs',
  'chicago bulls': 'Chicago Bulls',
  'charlotte hornets': 'Charlotte Hornets',
  'brooklyn nets': 'Brooklyn Nets',
  'dallas mavericks': 'Dallas Mavericks',
  
  // NHL
  'los angeles kings': 'Los Angeles Kings',
  'montreal canadiens': 'Montreal Canadiens',
  'new york rangers': 'New York Rangers',
  'toronto maple leafs': 'Toronto Maple Leafs',
  'edmonton oilers': 'Edmonton Oilers',
  'seattle kraken': 'Seattle Kraken',
  'florida panthers': 'Florida Panthers',
  'calgary flames': 'Calgary Flames',
  'detroit red wings': 'Detroit Red Wings',
};

const correctTeamName = (name: string): string => {
  const lower = name.toLowerCase();
  return TEAM_NAME_CORRECTIONS[lower] || name;
};

// ============================================
// POPULAR TEAMS
// ============================================

const POPULAR_TEAMS: string[] = [
  // Europa League teams
  'ferencvaros', 'rangers', 'slovan', 'sparta', 'stuttgart', 'az', 'lazio',
  'roma', 'tottenham', 'manchester united', 'porto', 'lyon', 'ajax',
  // Premier League
  'manchester united', 'manchester city', 'liverpool', 'arsenal', 'chelsea',
  'tottenham', 'real madrid', 'barcelona', 'bayern munich', 'psg', 'juventus',
  // NBA (lowered priority)
  'lakers', 'celtics', 'warriors', 'bulls', 'heat',
  // NHL
  'maple leafs', 'canadiens', 'rangers', 'oilers',
];

// ============================================
// CALCULATE MATCH POPULARITY SCORE
// ============================================

const calculatePopularityScore = (match: any): number => {
  let score = 0;
  
  const title = (match.title || '').toLowerCase();
  const category = (match.category || '').toLowerCase();
  const homeTeam = (match.teams?.home?.name || '').toLowerCase();
  const awayTeam = (match.teams?.away?.name || '').toLowerCase();
  
  // League/title score
  for (const [leagueName, points] of Object.entries(POPULAR_LEAGUES)) {
    if (title.includes(leagueName)) {
      score += points;
      break;
    }
  }
  
  // Category bonus (football prioritized)
  if (category === 'football') score += 50;
  if (category === 'basketball') score += 20;
  if (category === 'hockey') score += 20;
  
  // Team bonus
  POPULAR_TEAMS.forEach(team => {
    if (homeTeam.includes(team) || team.includes(homeTeam)) score += 25;
    if (awayTeam.includes(team) || team.includes(awayTeam)) score += 25;
  });
  
  // Popular flag bonus
  if (match.popular) score += 15;
  
  // Starting soon bonus
  if (match.date) {
    const now = Date.now();
    const hoursUntil = (match.date - now) / (1000 * 60 * 60);
    
    if (hoursUntil >= 0 && hoursUntil <= 6) {
      score += 40;
    } else if (hoursUntil > 0 && hoursUntil <= 24) {
      score += 20;
    }
  }
  
  return score;
};

// ============================================
// FETCH UPCOMING EVENTS FROM LEAGUE
// ============================================

const fetchUpcomingFromLeague = async (leagueId: number): Promise<any[]> => {
  try {
    const response = await fetch(
      `${SPORTSDB_API_V1}/eventsnextleague.php?id=${leagueId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      return (data.events || []).map((e: any) => ({
        id: e.idEvent,
        title: `${e.strLeague}: ${e.strHomeTeam} vs ${e.strAwayTeam}`,
        category: 'football',
        date: new Date(`${e.dateEvent}T${e.strTime || '00:00:00'}`).getTime(),
        teams: {
          home: { name: e.strHomeTeam },
          away: { name: e.strAwayTeam }
        },
        banner: e.strThumb || e.strPoster || null,
        homeBadge: e.strHomeTeamBadge,
        awayBadge: e.strAwayTeamBadge,
        homeTeam: e.strHomeTeam,
        awayTeam: e.strAwayTeam,
        league: e.strLeague,
        fromSportsDB: true,
        _score: 300, // High priority for direct TheSportsDB events
      }));
    }
  } catch (e) {
    console.warn('Failed to fetch league events');
  }
  return [];
};

// ============================================
// FETCH EVENT IMAGES
// ============================================

const fetchEventImages = async (homeTeam: string, awayTeam: string): Promise<{
  thumb: string | null;
  banner: string | null;
  homeBadge: string | null;
  awayBadge: string | null;
}> => {
  const correctedHome = correctTeamName(homeTeam);
  const correctedAway = correctTeamName(awayTeam);
  
  const searchVariations = [
    `${correctedHome}_vs_${correctedAway}`,
    `${homeTeam}_vs_${awayTeam}`,
  ];
  
  for (const eventName of searchVariations) {
    try {
      const response = await fetch(
        `${SPORTSDB_API_V1}/searchevents.php?e=${encodeURIComponent(eventName.replace(/ /g, '_'))}`,
        { signal: AbortSignal.timeout(4000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.event && data.event.length > 0) {
          const event = data.event[0];
          return {
            thumb: event.strThumb || event.strPoster || null,
            banner: event.strBanner || null,
            homeBadge: event.strHomeTeamBadge || null,
            awayBadge: event.strAwayTeamBadge || null,
          };
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  return { thumb: null, banner: null, homeBadge: null, awayBadge: null };
};

// ============================================
// FETCH TEAM INFO
// ============================================

const fetchTeamInfo = async (teamName: string): Promise<{ badge: string | null; fanart: string | null }> => {
  if (!teamName || teamName === 'TBA') return { badge: null, fanart: null };
  
  const correctedName = correctTeamName(teamName);
  
  try {
    const response = await fetch(
      `${SPORTSDB_API_V1}/searchteams.php?t=${encodeURIComponent(correctedName)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        return {
          badge: team.strBadge || team.strLogo || null,
          fanart: team.strFanart1 || team.strBanner || null,
        };
      }
    }
  } catch (e) {
    // Ignore
  }
  
  return { badge: null, fanart: null };
};

// ============================================
// GET MATCHES FROM WESTREAM
// ============================================

const getWeStreamMatches = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${WESTREAM_API}/matches`, {
      signal: AbortSignal.timeout(8000)
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
    // 1. Fetch upcoming events from popular European leagues (with images!)
    const [europaEvents, conferenceEvents, championsEvents] = await Promise.all([
      fetchUpcomingFromLeague(POPULAR_LEAGUE_IDS['UEFA Europa League']),
      fetchUpcomingFromLeague(POPULAR_LEAGUE_IDS['UEFA Conference League']),
      fetchUpcomingFromLeague(POPULAR_LEAGUE_IDS['UEFA Champions League']),
    ]);
    
    // Filter only events with images
    const sportsDbEvents = [...europaEvents, ...conferenceEvents, ...championsEvents]
      .filter(e => e.banner || (e.homeBadge && e.awayBadge));
    
    console.log(`📺 TheSportsDB events with images: ${sportsDbEvents.length}`);
    
    // 2. Get matches from WeStream
    const weStreamMatches = await getWeStreamMatches();
    
    // 3. Filter WeStream matches with teams
    const matchesWithTeams = weStreamMatches.filter(m => 
      m.teams?.home?.name && 
      m.teams?.away?.name && 
      m.teams.home.name !== 'TBA' &&
      m.teams.away.name !== 'TBA'
    );
    
    // 4. Calculate scores
    const scoredMatches = matchesWithTeams.map(match => ({
      ...match,
      _score: calculatePopularityScore(match)
    }));
    
    // 5. Sort by score
    scoredMatches.sort((a, b) => b._score - a._score);
    
    // 6. Combine: TheSportsDB events first (they have images), then WeStream
    const combinedMatches = [...sportsDbEvents, ...scoredMatches.slice(0, 20)];
    
    console.log(`📊 Top matches:`, combinedMatches.slice(0, 5).map(m => ({
      title: m.title,
      score: m._score,
      hasBanner: !!m.banner
    })));
    
    // 7. Enrich WeStream matches that don't have images
    const enrichedMatches: any[] = [];
    
    for (const match of combinedMatches) {
      if (enrichedMatches.length >= limit) break;
      
      // If already has images (from TheSportsDB direct), add it
      if (match.banner || (match.homeBadge && match.awayBadge)) {
        enrichedMatches.push(match);
        continue;
      }
      
      // Fetch images for WeStream matches
      const homeTeam = match.teams?.home?.name || '';
      const awayTeam = match.teams?.away?.name || '';
      
      const [eventImages, homeInfo, awayInfo] = await Promise.all([
        fetchEventImages(homeTeam, awayTeam),
        fetchTeamInfo(homeTeam),
        fetchTeamInfo(awayTeam),
      ]);
      
      const banner = eventImages.thumb || eventImages.banner || homeInfo.fanart || awayInfo.fanart;
      const homeBadge = eventImages.homeBadge || homeInfo.badge;
      const awayBadge = eventImages.awayBadge || awayInfo.badge;
      
      if (banner || (homeBadge && awayBadge)) {
        enrichedMatches.push({
          ...match,
          banner,
          homeBadge,
          awayBadge,
          homeTeam,
          awayTeam,
        });
      }
    }
    
    console.log(`🎬 Featured: ${enrichedMatches.length} matches with images`);
    return enrichedMatches.slice(0, limit);
  } catch (error) {
    console.error('Failed to get featured matches:', error);
    return [];
  }
};

// ============================================
// GET UPCOMING EVENTS FROM THESPORTSDB
// ============================================

export const getUpcomingEvents = async (leagueId: number): Promise<any[]> => {
  return fetchUpcomingFromLeague(leagueId);
};
