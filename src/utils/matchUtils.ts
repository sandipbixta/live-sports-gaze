import { Match } from '../types/sports';

export const consolidateMatches = (matches: Match[]): Match[] => {
  const matchMap = new Map<string, Match>();
  
  matches.forEach(match => {
    // Create unique key based on match identity (title, date, teams)
    const homeTeam = match.teams?.home?.name?.toLowerCase().trim() || '';
    const awayTeam = match.teams?.away?.name?.toLowerCase().trim() || '';
    const matchTitle = match.title?.toLowerCase().trim() || '';
    const matchDate = new Date(match.date).toISOString().split('T')[0];
    
    // Primary key: teams and date
    const teamKey = homeTeam && awayTeam 
      ? `${homeTeam}-vs-${awayTeam}-${matchDate}`
      : null;
    
    // Secondary key: title and date
    const titleKey = matchTitle 
      ? `${matchTitle}-${matchDate}`
      : null;
    
    // Use the most specific key available
    const uniqueKey = teamKey || titleKey || match.id;
    
    if (matchMap.has(uniqueKey)) {
      // Merge sources from duplicate match
      const existingMatch = matchMap.get(uniqueKey)!;
      const combinedSources = [...(existingMatch.sources || [])];
      
      // Add new sources if they don't already exist
      if (match.sources) {
        match.sources.forEach(newSource => {
          const exists = combinedSources.some(existing => 
            existing.source === newSource.source && existing.id === newSource.id
          );
          if (!exists) {
            combinedSources.push(newSource);
          }
        });
      }
      
      // Update the existing match with combined sources
      matchMap.set(uniqueKey, {
        ...existingMatch,
        sources: combinedSources,
        // Keep the match with more complete data
        ...(match.teams && !existingMatch.teams ? { teams: match.teams } : {}),
        ...(match.title && match.title.length > existingMatch.title.length ? { title: match.title } : {})
      });
    } else {
      // Add new match
      matchMap.set(uniqueKey, { ...match });
    }
  });
  
  return Array.from(matchMap.values());
};

export const filterCleanMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => {
    const title = match.title?.toLowerCase() || '';
    const id = match.id?.toLowerCase() || '';
    
    // Debug logging for India vs West Indies match
    if (title.includes('india') && title.includes('west')) {
      console.log('🔍 Found India vs West Indies match:', {
        title: match.title,
        id: match.id,
        date: match.date,
        sources: match.sources?.length || 0,
        category: match.category,
        sportId: match.sportId
      });
    }
    
    // Filter out unwanted football leagues/countries for football matches
    const isFootball = match.category === 'football' || match.sportId === 'football';
    if (isFootball) {
      const homeTeam = match.teams?.home?.name?.toLowerCase() || '';
      const awayTeam = match.teams?.away?.name?.toLowerCase() || '';
      
      const unwantedFootballRegions = [
        'china', 'chinese', 'csl', 'super league china',
        'korea', 'korean', 'k league', 'k-league', 'south korea',
        'hong kong', 'hongkong', 'hk',
        'thailand', 'thai', 'thai league',
        'indonesia', 'indonesian', 'liga indonesia',
        'bhutan', 'bhutanese',
        'japan', 'japanese', 'j league', 'j-league'
      ];
      
      const hasUnwantedRegion = unwantedFootballRegions.some(region => 
        title.includes(region) || 
        homeTeam.includes(region) || 
        awayTeam.includes(region) ||
        id.includes(region.replace(/\s+/g, '-'))
      );
      
      if (hasUnwantedRegion) {
        return false;
      }
    }
    
    // Extended unwanted content filter
    const unwantedKeywords = [
      'sky sports news',
      'advertisement',
      'ad break',
      'promo',
      'commercial',
      'highlights only',
      'preview',
      'recap',
      'analysis',
      'talk show',
      'studio',
      'breaking news',
      'weather',
      'test transmission',
      'technical difficulties',
      'coming soon',
      'maintenance',
      'offline',
      'no signal',
      'unavailable',
      'error'
    ];
    
    // Check if title contains unwanted keywords
    const hasUnwantedContent = unwantedKeywords.some(keyword => 
      title.includes(keyword) || id.includes(keyword.replace(/\s+/g, '-'))
    );
    
    // Minimum quality requirements
    const hasValidTitle = match.title && match.title.length > 3;
    const hasValidDate = match.date;
    const hasMinimumSources = match.sources && match.sources.length > 0;
    
    // Filter out matches with suspicious titles (too short, all caps, weird characters)
    const isSuspiciousTitle = !match.title || 
      match.title.length < 4 || 
      (match.title.length < 15 && match.title === match.title.toUpperCase()) ||
      /^[0-9\s\-_]+$/.test(match.title) || // Only numbers, spaces, dashes, underscores
      match.title.includes('???') ||
      match.title.includes('***');
    
    const isValid = !hasUnwantedContent && 
                    hasValidTitle && 
                    hasValidDate && 
                    hasMinimumSources &&
                    !isSuspiciousTitle;
    
    // Debug logging for India vs West Indies match
    if (title.includes('india') && title.includes('west')) {
      console.log('🔍 India vs West Indies filtering:', {
        isValid,
        hasUnwantedContent,
        hasValidTitle,
        hasValidDate,
        hasMinimumSources,
        isSuspiciousTitle,
        title: match.title
      });
    }
    
    return isValid;
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
