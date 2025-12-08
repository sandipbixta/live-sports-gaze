import { CDNMatch, CDNMatchData } from '@/types/cdnMatch';

// CDN Match data - can be updated dynamically
let cdnMatchData: CDNMatchData = {
  'cdn-live-tv': {}
};

// Set match data (for dynamic updates)
export const setCDNMatchData = (data: CDNMatchData) => {
  cdnMatchData = data;
};

// Get all matches for a specific sport
export const getCDNMatchesBySport = (sport: string): CDNMatch[] => {
  return cdnMatchData['cdn-live-tv'][sport] || [];
};

// Get all sports available
export const getCDNSports = (): string[] => {
  return Object.keys(cdnMatchData['cdn-live-tv']);
};

// Get all matches across all sports
export const getAllCDNMatches = (): CDNMatch[] => {
  const allMatches: CDNMatch[] = [];
  for (const sport of Object.keys(cdnMatchData['cdn-live-tv'])) {
    allMatches.push(...cdnMatchData['cdn-live-tv'][sport]);
  }
  return allMatches;
};

// Get live matches only
export const getLiveCDNMatches = (): CDNMatch[] => {
  return getAllCDNMatches().filter(match => match.status === 'live');
};

// Get finished matches
export const getFinishedCDNMatches = (): CDNMatch[] => {
  return getAllCDNMatches().filter(match => match.status === 'finished');
};

// Get upcoming matches
export const getUpcomingCDNMatches = (): CDNMatch[] => {
  return getAllCDNMatches().filter(match => match.status === 'upcoming');
};

// Get matches by country
export const getCDNMatchesByCountry = (country: string): CDNMatch[] => {
  return getAllCDNMatches().filter(match => 
    match.country.toLowerCase() === country.toLowerCase()
  );
};

// Get matches with available channels
export const getCDNMatchesWithChannels = (): CDNMatch[] => {
  return getAllCDNMatches().filter(match => match.channels.length > 0);
};

// Convert CDN match to format compatible with existing match cards
export const convertCDNMatchToDisplay = (match: CDNMatch, sport: string = 'Soccer') => ({
  id: match.gameID,
  title: `${match.homeTeam} vs ${match.awayTeam}`,
  homeTeam: {
    name: match.homeTeam,
    logo: match.homeTeamIMG,
  },
  awayTeam: {
    name: match.awayTeam,
    logo: match.awayTeamIMG,
  },
  date: match.start,
  time: match.time,
  tournament: match.tournament,
  country: match.country,
  countryFlag: match.countryIMG,
  status: match.status,
  channels: match.channels,
  sport: sport,
  source: 'cdn-live-tv' as const,
});
