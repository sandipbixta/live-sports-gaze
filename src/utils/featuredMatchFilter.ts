import { Match } from '@/types/sports';
import { isMatchLive } from './matchUtils';

// Top priority: International football (country matches)
const INTERNATIONAL_FOOTBALL = [
  'world cup', 'fifa world cup',
  'euro', 'european championship',
  'copa america',
  'nations league', 'uefa nations',
  'world cup qualifiers', 'wc qualifiers', 'qualifying',
  'international friendly', 'friendly',
  'conmebol', 'concacaf',
  'afcon', 'africa cup',
  'asian cup',
];

// European Top 5 Leagues
const TOP_5_LEAGUES = [
  'premier league', 'epl', 'english premier',
  'la liga', 'laliga', 'spanish la liga',
  'serie a', 'italian serie',
  'bundesliga', 'german bundesliga',
  'ligue 1', 'ligue1', 'french ligue',
];

// Major football competitions
const MAJOR_COMPETITIONS = [
  'champions league', 'ucl', 'uefa champions',
  'europa league', 'uel', 'uefa europa',
  'conference league',
  'copa libertadores',
  'copa del rey',
  'fa cup',
  'carabao cup',
  'super cup', 'supercup',
  'club world cup',
];

// Top 20 FIFA-ranked countries (national teams)
const TOP_COUNTRIES = [
  'argentina', 'france', 'spain', 'england', 'brazil', 'belgium', 
  'netherlands', 'portugal', 'colombia', 'italy', 'uruguay', 'croatia',
  'germany', 'morocco', 'switzerland', 'usa', 'mexico', 'japan',
  'senegal', 'denmark', 'united states'
];

// Popular teams across sports
const POPULAR_TEAMS = [
  // High priority teams
  'al nassr', 'al-nassr', 'alnassr',
  'inter miami', 'miami',
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
  
  // Exclude women's matches
  if (title.includes('women') || title.includes('female') || title.includes('ladies')) {
    return false;
  }
  
  // HIGHEST PRIORITY: International football (country matches)
  if (category.includes('football') || category.includes('soccer')) {
    if (INTERNATIONAL_FOOTBALL.some(comp => title.includes(comp))) {
      return true;
    }
  }
  
  // HIGH PRIORITY: Top 5 European leagues
  if (category.includes('football') || category.includes('soccer')) {
    if (TOP_5_LEAGUES.some(league => title.includes(league) || category.includes(league))) {
      return true;
    }
  }
  
  // Other major football competitions
  if (category.includes('football') || category.includes('soccer')) {
    if (MAJOR_COMPETITIONS.some(comp => title.includes(comp))) {
      return true;
    }
  }
  
  // HIGH PRIORITY: Specific popular teams (Al Nassr, Inter Miami)
  if (POPULAR_TEAMS.slice(0, 3).some(team => title.includes(team))) {
    return true;
  }
  
  // HIGH PRIORITY: Popular basketball (NBA, Euroleague)
  if (category.includes('basketball') || category.includes('basket')) {
    const popularBasketball = ['nba', 'euroleague'];
    if (popularBasketball.some(league => title.includes(league) || category.includes(league))) {
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
  
  // HIGHEST PRIORITY: Fighting (UFC/MMA/Boxing)
  if (category.includes('mma') || category.includes('ufc') || category.includes('fighting') || 
      category.includes('boxing') || category.includes('fight')) {
    return true; // All fights are featured
  }
  
  // Check for major wrestling
  if (category.includes('wrestling') || category.includes('wwe') || category.includes('aew')) {
    if (MAJOR_WRESTLING.some(event => title.includes(event))) {
      return true;
    }
  }
  
  // HIGH PRIORITY: Major cricket (popular only)
  if (category.includes('cricket')) {
    // Only IPL, World Cup, T20, and other major tournaments
    const popularCricket = ['ipl', 'world cup', 't20', 'odi', 'test match', 'ashes', 'bbl', 'psl'];
    if (popularCricket.some(comp => title.includes(comp) || category.includes(comp))) {
      return true;
    }
  }
  
  // HIGH PRIORITY: AFL (popular matches)
  if (category.includes('afl') || category.includes('australian football')) {
    // All AFL matches are considered popular
    return true;
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
  
  // Check for top FIFA-ranked countries in title
  if (TOP_COUNTRIES.some(country => title.includes(country))) {
    return true;
  }
  
  // Check for popular teams
  if (POPULAR_TEAMS.some(team => title.includes(team))) {
    return true;
  }
  
  // Check team names if available
  if (match.teams?.home?.name || match.teams?.away?.name) {
    const homeTeam = (match.teams.home?.name || '').toLowerCase();
    const awayTeam = (match.teams.away?.name || '').toLowerCase();
    
    // Check for top countries in team names
    if (TOP_COUNTRIES.some(country => homeTeam.includes(country) || awayTeam.includes(country))) {
      return true;
    }
    
    // Check for popular club teams
    if (POPULAR_TEAMS.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
      return true;
    }
  }
  
  return false;
};

/**
 * Filter and sort matches by featured status
 * Prioritizes: 1) Live matches, 2) Upcoming matches (sorted by date)
 */
export const getFeaturedMatches = (matches: Match[], limit: number = 10): Match[] => {
  // Filter for featured matches with posters
  const featuredWithPosters = matches
    .filter(match => match.poster && match.poster.trim() !== '') // Must have poster
    .filter(isFeaturedMatch); // Must be featured
  
  // Separate live and upcoming matches using isMatchLive utility
  const liveMatches = featuredWithPosters.filter(match => isMatchLive(match));
  
  const upcomingMatches = featuredWithPosters
    .filter(match => !isMatchLive(match))
    .sort((a, b) => {
      // Sort upcoming matches by date (soonest first)
      return a.date - b.date;
    });
  
  // Combine: live matches first, then upcoming matches
  return [...liveMatches, ...upcomingMatches].slice(0, limit);
};
