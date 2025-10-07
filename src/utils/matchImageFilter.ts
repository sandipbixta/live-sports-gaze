import { Match } from '../types/sports';

/**
 * Check if a match has visual content (poster or team badges)
 */
export const hasMatchImage = (match: Match): boolean => {
  // Check if match has a poster
  if (match.poster && match.poster.trim() !== '') {
    return true;
  }

  // Check if match has team badges
  const hasHomeBadge = match.teams?.home?.badge && match.teams.home.badge.trim() !== '';
  const hasAwayBadge = match.teams?.away?.badge && match.teams.away.badge.trim() !== '';

  return hasHomeBadge || hasAwayBadge;
};

/**
 * Filter matches to only include those with images for home page display
 */
export const filterMatchesWithImages = (matches: Match[]): Match[] => {
  return matches.filter(hasMatchImage);
};
