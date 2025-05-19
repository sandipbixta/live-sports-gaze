
import { Match, Sport } from "../types/sports";

// Check if a match is currently live
export const isMatchLive = (match: Match): boolean => {
  // A match is considered live if it has sources AND the match time is within 2 hours of now
  const matchTime = new Date(match.date).getTime();
  const now = new Date().getTime();
  const twoHoursInMs = 2 * 60 * 60 * 1000;
  
  return (
    match.sources && 
    match.sources.length > 0 && 
    Math.abs(matchTime - now) < twoHoursInMs
  );
};

// Format match time
export const formatMatchTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Get sport name by ID
export const getSportName = (sportId: string, sports: Sport[]): string => {
  const sport = sports.find(s => s.id === sportId);
  if (sport) return sport.name;
  
  // Default mappings for common sport IDs
  const sportMappings: Record<string, string> = {
    '1': 'Football',
    '2': 'Basketball',
    '3': 'Ice Hockey',
    '4': 'Tennis',
    'football': 'Football',
    'basketball': 'Basketball',
    'hockey': 'Ice Hockey'
  };
  
  return sportMappings[sportId] || 'Other Sports';
};

// Helper function to group matches by sport
export const groupMatchesBySport = (matches: Match[]) => {
  const groupedMatches: Record<string, Match[]> = {};
  
  matches.forEach(match => {
    const sportId = match.sportId || "unknown";
    if (!groupedMatches[sportId]) {
      groupedMatches[sportId] = [];
    }
    groupedMatches[sportId].push(match);
  });
  
  return groupedMatches;
};
