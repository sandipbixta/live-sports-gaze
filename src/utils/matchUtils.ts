import { Match } from '../types/sports';

// No consolidation - use matches directly from API with all their sources
export const consolidateMatches = (matches: Match[]): Match[] => {
  // Return matches as-is from API without merging or consolidation
  return matches;
};

// Filter matches that have stream sources available
export const filterMatchesWithSources = (matches: Match[]): Match[] => {
  return matches.filter(match => {
    // Must have sources array with at least one source
    const hasSources = match.sources && Array.isArray(match.sources) && match.sources.length > 0;
    
    if (!hasSources) {
      console.log('🚫 Filtered out match without sources:', match.title);
    }
    
    return hasSources;
  });
};

// Minimal filtering - only check if matches have sources
export const filterCleanMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => {
    // Only filter: Must have stream sources
    const hasSources = match.sources && Array.isArray(match.sources) && match.sources.length > 0;
    return hasSources;
  });
};

export const isMatchLive = (match: Match): boolean => {
  const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
  const now = new Date().getTime();
  const fiveMinutesBeforeMs = 5 * 60 * 1000;
  
  // Cricket matches (especially test matches) can last up to 5 days
  const isCricket = match.category === 'cricket' || match.sportId === 'cricket';
  const liveWindowMs = isCricket 
    ? 7 * 24 * 60 * 60 * 1000  // 7 days for cricket (test matches last 5 days)
    : 4 * 60 * 60 * 1000;       // 4 hours for other sports
  
  // Match is live if:
  // 1. It has sources available
  // 2. Current time is between 5 minutes before match time and live window after match time
  return match.sources && 
         match.sources.length > 0 && 
         now >= matchTime - fiveMinutesBeforeMs && 
         now <= matchTime + liveWindowMs;
};

export const isMatchEnded = (match: Match): boolean => {
  const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
  const now = new Date().getTime();
  
  // Cricket matches can last up to 5 days, other sports typically 4 hours
  const isCricket = match.category === 'cricket' || match.sportId === 'cricket';
  const endedThresholdMs = isCricket 
    ? 7 * 24 * 60 * 60 * 1000  // 7 days for cricket
    : 4 * 60 * 60 * 1000;       // 4 hours for other sports
  
  // Match is ended if it's past the threshold and not live
  return now - matchTime > endedThresholdMs && !isMatchLive(match);
};

export const filterActiveMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => !isMatchEnded(match));
};

export const sortMatchesByViewers = (matches: Match[]): Match[] => {
  return [...matches].sort((a, b) => {
    // Sort by viewer count (highest first), then by live status, then by date
    const aViewers = a.viewerCount || 0;
    const bViewers = b.viewerCount || 0;
    
    if (aViewers !== bViewers) {
      return bViewers - aViewers; // Higher viewers first
    }
    
    // If viewer counts are equal, prioritize live matches
    const aIsLive = isMatchLive(a);
    const bIsLive = isMatchLive(b);
    
    if (aIsLive !== bIsLive) {
      return bIsLive ? 1 : -1; // Live matches first
    }
    
    // Finally sort by date (earliest first)
    return a.date - b.date;
  });
};
