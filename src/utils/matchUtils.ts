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
    
    // Filter out unwanted football leagues/countries for football matches
    const isFootball = match.category === 'football' || match.sportId === 'football';
    if (isFootball) {
      const homeTeam = match.teams?.home?.name?.toLowerCase() || '';
      const awayTeam = match.teams?.away?.name?.toLowerCase() || '';
      
      // Filter out women's football matches
      const womensKeywords = [
        'women', 'womens', "women's", 'female', 'ladies', 'feminino', 'femenino',
        'femminile', 'frauen', 'dames', 'women fc', 'women cf', 'wfc', 'wcf',
        'w.f.c', 'w.c.f', 'ladies fc', 'ladies cf'
      ];
      
      const isWomensMatch = womensKeywords.some(keyword => 
        title.includes(keyword) || 
        homeTeam.includes(keyword) || 
        awayTeam.includes(keyword) ||
        id.includes(keyword.replace(/\s+/g, '-'))
      );
      
      if (isWomensMatch) {
        return false;
      }
      
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
    
    return !hasUnwantedContent && 
           hasValidTitle && 
           hasValidDate && 
           hasMinimumSources &&
           !isSuspiciousTitle;
  });
};

export const isMatchLive = (match: Match): boolean => {
  const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
  const now = new Date().getTime();
  const fourHoursInMs = 4 * 60 * 60 * 1000;
  const fiveMinutesBeforeMs = 5 * 60 * 1000; // Changed from 1 hour to 5 minutes
  
  // Match is live if:
  // 1. It has sources available
  // 2. Current time is between 5 minutes before match time and 4 hours after match time
  return match.sources && 
         match.sources.length > 0 && 
         now >= matchTime - fiveMinutesBeforeMs && 
         now <= matchTime + fourHoursInMs;
};

export const isMatchEnded = (match: Match): boolean => {
  const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
  const now = new Date().getTime();
  const fourHoursInMs = 4 * 60 * 60 * 1000;
  
  // Match is ended if it's more than 4 hours past match time and not live
  return now - matchTime > fourHoursInMs && !isMatchLive(match);
};

export const filterActiveMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => !isMatchEnded(match));
};
