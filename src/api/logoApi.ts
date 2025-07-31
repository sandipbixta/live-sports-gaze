// API for fetching team logos and country flags

const SPORTS_DB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const REST_COUNTRIES_BASE = 'https://restcountries.com/v3.1';

// Cache for logos to avoid repeated requests
const logoCache = new Map<string, string>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for logos

interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
  strTeamLogo: string;
  strCountry: string;
  strLeague: string;
}

interface CountryFlag {
  name: { common: string };
  flags: { png: string; svg: string };
  flag: string;
}

export const searchTeamLogo = async (teamName: string): Promise<string | null> => {
  const cacheKey = `team-${teamName.toLowerCase()}`;
  
  // Check cache first
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) || null;
  }

  try {
    const encodedTeam = encodeURIComponent(teamName);
    const response = await fetch(`${SPORTS_DB_BASE}/searchteams.php?t=${encodedTeam}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.teams && data.teams.length > 0) {
      const team = data.teams[0] as SportsDBTeam;
      const logoUrl = team.strTeamBadge || team.strTeamLogo;
      
      if (logoUrl) {
        logoCache.set(cacheKey, logoUrl);
        return logoUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching team logo:', error);
    return null;
  }
};

export const getCountryFlag = async (countryName: string): Promise<string | null> => {
  const cacheKey = `flag-${countryName.toLowerCase()}`;
  
  // Check cache first
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) || null;
  }

  try {
    const encodedCountry = encodeURIComponent(countryName);
    const response = await fetch(`${REST_COUNTRIES_BASE}/name/${encodedCountry}?fields=name,flags`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const country = data[0] as CountryFlag;
      const flagUrl = country.flags?.png || country.flags?.svg;
      
      if (flagUrl) {
        logoCache.set(cacheKey, flagUrl);
        return flagUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching country flag:', error);
    return null;
  }
};

export const getLeagueTeams = async (leagueName: string): Promise<SportsDBTeam[]> => {
  try {
    const encodedLeague = encodeURIComponent(leagueName);
    const response = await fetch(`${SPORTS_DB_BASE}/search_all_teams.php?l=${encodedLeague}`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.teams || [];
  } catch (error) {
    console.error('Error fetching league teams:', error);
    return [];
  }
};

// Helper function to get logo by team name with fallback options
export const getTeamLogo = async (teamName: string, countryName?: string): Promise<string> => {
  // Try team logo first
  const teamLogo = await searchTeamLogo(teamName);
  if (teamLogo) return teamLogo;
  
  // Fallback to country flag if available
  if (countryName) {
    const countryFlag = await getCountryFlag(countryName);
    if (countryFlag) return countryFlag;
  }
  
  // Default placeholder
  return '/placeholder.svg';
};

// Popular leagues for better logo coverage
export const POPULAR_LEAGUES = [
  'English Premier League',
  'Spanish La Liga',
  'German Bundesliga',
  'Italian Serie A',
  'French Ligue 1',
  'UEFA Champions League',
  'UEFA Europa League',
  'NBA',
  'NFL',
  'MLB',
  'NHL'
];