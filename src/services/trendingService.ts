
import { Match } from '../types/sports';
import { isTrendingMatch } from '../utils/popularLeagues';

// Simulate Google Trends data based on real factors
export interface TrendingData {
  searchVolume: number;
  trend: 'rising' | 'stable' | 'falling';
  regionInterest: string[];
  relatedQueries: string[];
  trendingScore: number;
}

// Simulate real-time trending factors
const getTrendingFactors = (match: Match): TrendingData => {
  const now = new Date();
  const matchTime = new Date(match.date);
  const timeDiff = matchTime.getTime() - now.getTime();
  const hoursToMatch = timeDiff / (1000 * 60 * 60);
  
  let searchVolume = 100;
  let trend: 'rising' | 'stable' | 'falling' = 'stable';
  let regionInterest: string[] = ['Global'];
  let relatedQueries: string[] = [];
  
  // Boost trending score based on time proximity
  if (hoursToMatch <= 2 && hoursToMatch >= -1) {
    // Live or about to start
    searchVolume *= 5;
    trend = 'rising';
  } else if (hoursToMatch <= 24 && hoursToMatch > 2) {
    // Within 24 hours
    searchVolume *= 2;
    trend = 'rising';
  }
  
  // Get base trending data from existing system
  const baseTrending = isTrendingMatch(match.title);
  searchVolume += baseTrending.score * 10;
  
  // Add region interest based on teams/leagues
  const title = match.title.toLowerCase();
  if (title.includes('premier league') || title.includes('chelsea') || title.includes('arsenal') || title.includes('liverpool')) {
    regionInterest = ['United Kingdom', 'Global', 'United States'];
  } else if (title.includes('la liga') || title.includes('barcelona') || title.includes('real madrid')) {
    regionInterest = ['Spain', 'Global', 'Latin America'];
  } else if (title.includes('serie a') || title.includes('juventus') || title.includes('milan')) {
    regionInterest = ['Italy', 'Global', 'Europe'];
  } else if (title.includes('bundesliga') || title.includes('bayern') || title.includes('dortmund')) {
    regionInterest = ['Germany', 'Global', 'Europe'];
  } else if (title.includes('champions league') || title.includes('ucl')) {
    regionInterest = ['Global', 'Europe', 'Middle East'];
  }
  
  // Generate related queries based on match
  relatedQueries = [
    `${match.title} live stream`,
    `watch ${match.title} online`,
    `${match.title} free`,
    `${match.title} highlights`,
    'football stream today'
  ];
  
  if (baseTrending.seoTerms) {
    relatedQueries.push(...baseTrending.seoTerms.slice(0, 3));
  }
  
  // Calculate final trending score
  let trendingScore = baseTrending.score;
  
  // Live matches get huge boost
  if (match.sources && match.sources.length > 0 && hoursToMatch <= 2) {
    trendingScore += 15;
  }
  
  // Weekend matches get boost
  const dayOfWeek = matchTime.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    trendingScore += 5;
  }
  
  // Evening matches (prime time) get boost
  const hour = matchTime.getHours();
  if (hour >= 18 && hour <= 22) {
    trendingScore += 3;
  }
  
  return {
    searchVolume: Math.round(searchVolume),
    trend,
    regionInterest,
    relatedQueries: relatedQueries.slice(0, 5),
    trendingScore
  };
};

export const getGoogleTrendingMatches = (matches: Match[]): Array<Match & { trendingData: TrendingData }> => {
  return matches
    .map(match => ({
      ...match,
      trendingData: getTrendingFactors(match)
    }))
    .filter(match => match.trendingData.trendingScore >= 8) // Only show highly trending
    .sort((a, b) => b.trendingData.trendingScore - a.trendingData.trendingScore)
    .slice(0, 10); // Top 10 trending matches
};

export const getTrendingIndicator = (trendingScore: number): { icon: string; label: string; color: string } => {
  if (trendingScore >= 20) {
    return { icon: '🔥', label: 'Viral', color: 'text-red-500' };
  } else if (trendingScore >= 15) {
    return { icon: '📈', label: 'Trending High', color: 'text-orange-500' };
  } else if (trendingScore >= 10) {
    return { icon: '⭐', label: 'Popular', color: 'text-yellow-500' };
  } else {
    return { icon: '👁️', label: 'Watched', color: 'text-blue-500' };
  }
};
