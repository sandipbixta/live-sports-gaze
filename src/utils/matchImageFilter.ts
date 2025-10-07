import { Match } from '../types/sports';

/**
 * Check if a match has visual content (poster or team badges)
 */
export const hasMatchImage = (match: Match): boolean => {
  // Check if match has a poster
  if (match.poster && match.poster.trim() !== '') {
    return true;
  }

  // Check additional image properties that might exist in API response
  const matchAny = match as any;
  if (matchAny.photo && matchAny.photo.trim() !== '') {
    return true;
  }
  if (matchAny.image && matchAny.image.trim() !== '') {
    return true;
  }
  if (matchAny.web && matchAny.web.trim() !== '') {
    return true;
  }

  // Check if match has team badges or logos
  const hasHomeBadge = match.teams?.home?.badge && match.teams.home.badge.trim() !== '';
  const hasAwayBadge = match.teams?.away?.badge && match.teams.away.badge.trim() !== '';
  const hasHomeLogo = match.teams?.home?.logo && match.teams.home.logo.trim() !== '';
  const hasAwayLogo = match.teams?.away?.logo && match.teams.away.logo.trim() !== '';

  return hasHomeBadge || hasAwayBadge || hasHomeLogo || hasAwayLogo;
};

/**
 * Filter matches to only include those with images for home page display
 */
export const filterMatchesWithImages = (matches: Match[]): Match[] => {
  return matches.filter(hasMatchImage);
};
