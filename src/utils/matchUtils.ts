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
    
    return !title.includes('sky sports news') && 
           !id.includes('sky-sports-news') &&
           !title.includes('advertisement') &&
           !title.includes('ad break') &&
           !title.includes('promo') &&
           match.title && // Must have a title
           match.date; // Must have a date
  });
};

export const isMatchLive = (match: Match): boolean => {
  const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
  const now = new Date().getTime();
  const threeHoursInMs = 3 * 60 * 60 * 1000;
  const oneHourInMs = 60 * 60 * 1000;
  
  return match.sources && 
         match.sources.length > 0 && 
         matchTime - now < oneHourInMs && 
         now - matchTime < threeHoursInMs;
};

export const isMatchEnded = (match: Match): boolean => {
  const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
  const now = new Date().getTime();
  const threeHoursInMs = 3 * 60 * 60 * 1000;
  
  // Match is ended if it's more than 3 hours past match time and not live
  return now - matchTime > threeHoursInMs && !isMatchLive(match);
};

export const filterActiveMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => !isMatchEnded(match));
};
