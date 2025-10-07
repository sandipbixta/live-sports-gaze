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
