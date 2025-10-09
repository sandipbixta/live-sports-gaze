import { Match } from '@/types/sports';

// Major football leagues and competitions
const MAJOR_COMPETITIONS = [
  'champions league', 'ucl', 'uefa champions',
  'europa league', 'uel', 'uefa europa',
  'conference league',
  'premier league', 'epl', 'english premier',
  'la liga', 'laliga', 'spanish',
  'serie a', 'italian',
  'bundesliga', 'german',
  'ligue 1', 'ligue1', 'french',
  'world cup', 'fifa world cup',
  'euro', 'european championship',
  'copa america',
  'copa libertadores',
  'copa del rey',
  'fa cup',
  'carabao cup',
  'super cup', 'supercup',
  'club world cup',
  // International football
  'nations league', 'uefa nations',
  'world cup qualifiers', 'wc qualifiers', 'qualifying',
  'international friendly', 'friendly',
  'conmebol', 'concacaf',
  'afcon', 'africa cup',
  'asian cup',
];

// Popular teams across sports
const POPULAR_TEAMS = [
  // Football
  'real madrid', 'barcelona', 'bayern munich', 'manchester united', 'manchester city',
  'liverpool', 'chelsea', 'arsenal', 'tottenham', 'psg', 'paris saint',
  'juventus', 'milan', 'inter milan', 'napoli', 'atletico madrid',
  'borussia dortmund', 'ajax', 'benfica', 'porto',
  // Basketball
  'lakers', 'warriors', 'celtics', 'heat', 'knicks', 'bulls', 'nets',
  // American Football
  'patriots', 'cowboys', 'packers', 'steelers', 'chiefs', 'eagles',
];

// Major basketball leagues/competitions
const MAJOR_BASKETBALL = ['nba', 'euroleague', 'eurobasket'];

// Major American football
const MAJOR_AMERICAN_FOOTBALL = ['nfl', 'super bowl', 'playoff'];

// Major baseball
const MAJOR_BASEBALL = ['mlb', 'world series', 'playoff'];

// Major tennis
const MAJOR_TENNIS = ['wimbledon', 'us open', 'french open', 'australian open', 'grand slam', 'atp', 'wta'];

// Major UFC/MMA
const MAJOR_UFC = ['ufc', 'bellator', 'pfl', 'one championship', 'title fight', 'main event'];

// Major Wrestling
const MAJOR_WRESTLING = ['wwe', 'aew', 'wrestlemania', 'summerslam', 'royal rumble', 'all out'];

// Major Cricket
const MAJOR_CRICKET = ['ipl', 'world cup', 'ashes', 't20', 'odi', 'test match', 'bbl', 'psl', 'champions trophy'];

// Major AFL
const MAJOR_AFL = ['afl', 'grand final', 'finals series'];

// Major Rugby
const MAJOR_RUGBY = ['six nations', 'rugby world cup', 'rugby championship', 'super rugby', 'premiership'];

// Major Hockey
const MAJOR_HOCKEY = ['nhl', 'stanley cup', 'playoff'];

// Major Motorsports
const MAJOR_MOTORSPORTS = ['formula 1', 'f1', 'grand prix', 'motogp', 'nascar'];

// Major Boxing
const MAJOR_BOXING = ['title fight', 'championship', 'wbc', 'wba', 'ibf', 'wbo'];

/**
 * Check if a match is featured/trending based on competition, teams, or sport
 */
export const isFeaturedMatch = (match: Match): boolean => {
  const title = match.title.toLowerCase();
  const category = (match.category || '').toLowerCase();
  
  // Check for major football competitions
  if (category.includes('football') || category.includes('soccer')) {
    if (MAJOR_COMPETITIONS.some(comp => title.includes(comp))) {
      return true;
    }
  }
  
  // Check for major basketball
  if (category.includes('basketball') || category.includes('basket')) {
    if (MAJOR_BASKETBALL.some(league => title.includes(league) || category.includes(league))) {
      return true;
    }
  }
  
  // Check for major American football
  if (category.includes('american') || category.includes('nfl')) {
    if (MAJOR_AMERICAN_FOOTBALL.some(league => title.includes(league) || category.includes(league))) {
      return true;
    }
  }
  
  // Check for major baseball
  if (category.includes('baseball')) {
    if (MAJOR_BASEBALL.some(league => title.includes(league) || category.includes(league))) {
      return true;
    }
  }
  
  // Check for major tennis
  if (category.includes('tennis')) {
    if (MAJOR_TENNIS.some(tournament => title.includes(tournament))) {
      return true;
    }
  }
  
  // Check for major UFC/MMA
  if (category.includes('mma') || category.includes('ufc') || category.includes('fighting')) {
    if (MAJOR_UFC.some(event => title.includes(event) || category.includes(event))) {
      return true;
    }
  }
  
  // Check for major wrestling
  if (category.includes('wrestling') || category.includes('wwe') || category.includes('aew')) {
    if (MAJOR_WRESTLING.some(event => title.includes(event))) {
      return true;
    }
  }
  
  // Check for major cricket
  if (category.includes('cricket')) {
    if (MAJOR_CRICKET.some(comp => title.includes(comp) || category.includes(comp))) {
      return true;
    }
  }
  
  // Check for major AFL
  if (category.includes('afl') || category.includes('australian football')) {
    if (MAJOR_AFL.some(comp => title.includes(comp) || category.includes(comp))) {
      return true;
    }
  }
  
  // Check for major rugby
  if (category.includes('rugby')) {
    if (MAJOR_RUGBY.some(comp => title.includes(comp))) {
      return true;
    }
  }
  
  // Check for major hockey
  if (category.includes('hockey') || category.includes('nhl')) {
    if (MAJOR_HOCKEY.some(league => title.includes(league) || category.includes(league))) {
      return true;
    }
  }
  
  // Check for major motorsports
  if (category.includes('motor') || category.includes('racing') || category.includes('formula')) {
    if (MAJOR_MOTORSPORTS.some(event => title.includes(event))) {
      return true;
    }
  }
  
  // Check for major boxing
  if (category.includes('boxing') || category.includes('fight')) {
    if (MAJOR_BOXING.some(event => title.includes(event))) {
      return true;
    }
  }
  
  // Check for popular teams
  if (POPULAR_TEAMS.some(team => title.includes(team))) {
    return true;
  }
  
  // Check team names if available
  if (match.teams?.home?.name || match.teams?.away?.name) {
    const homeTeam = (match.teams.home?.name || '').toLowerCase();
    const awayTeam = (match.teams.away?.name || '').toLowerCase();
    
    if (POPULAR_TEAMS.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
      return true;
    }
  }
  
  return false;
};

/**
 * Filter and sort matches by featured status
 */
export const getFeaturedMatches = (matches: Match[], limit: number = 10): Match[] => {
  return matches
    .filter(match => match.poster && match.poster.trim() !== '') // Must have poster
    .filter(isFeaturedMatch) // Must be featured
    .slice(0, limit);
};
