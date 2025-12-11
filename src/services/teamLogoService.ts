// Service to fetch team logos from TheSportsDB free API

const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/3';

// Cache to avoid repeated API calls
const logoCache = new Map<string, string>();

// Fetch team logo from TheSportsDB
export const getTeamLogo = async (teamName: string): Promise<string> => {
  if (!teamName || teamName.trim() === '') return '';
  
  // Check cache first
  const cacheKey = teamName.toLowerCase().trim();
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) || '';
  }
  
  try {
    const response = await fetch(
      `${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`
    );
    const data = await response.json();
    
    let logoUrl = '';
    if (data.teams && data.teams.length > 0) {
      // Prefer badge over logo
      logoUrl = data.teams[0].strBadge || data.teams[0].strLogo || '';
    }
    
    // Cache the result (even if empty)
    logoCache.set(cacheKey, logoUrl);
    return logoUrl;
  } catch (error) {
    console.error('Failed to fetch team logo for:', teamName, error);
    logoCache.set(cacheKey, '');
    return '';
  }
};

// Enhance match with team logos
export const enhanceMatchWithLogos = async (match: any): Promise<any> => {
  if (!match.teams) return match;
  
  // Skip if logos already exist
  if (match.teams.home?.badge && match.teams.away?.badge) {
    return match;
  }
  
  const [homeLogo, awayLogo] = await Promise.all([
    match.teams.home?.name && !match.teams.home?.badge 
      ? getTeamLogo(match.teams.home.name) 
      : Promise.resolve(match.teams.home?.badge || ''),
    match.teams.away?.name && !match.teams.away?.badge 
      ? getTeamLogo(match.teams.away.name) 
      : Promise.resolve(match.teams.away?.badge || '')
  ]);
  
  return {
    ...match,
    teams: {
      home: {
        ...match.teams.home,
        badge: homeLogo || match.teams.home?.badge || ''
      },
      away: {
        ...match.teams.away,
        badge: awayLogo || match.teams.away?.badge || ''
      }
    }
  };
};

// Enhance multiple matches with logos
export const enhanceMatchesWithLogos = async (matches: any[]): Promise<any[]> => {
  // Process in batches to avoid too many concurrent requests
  const batchSize = 5;
  const results: any[] = [];
  
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const enhanced = await Promise.all(batch.map(enhanceMatchWithLogos));
    results.push(...enhanced);
  }
  
  return results;
};

// Pre-load common team logos (optional optimization)
export const preloadCommonTeams = async () => {
  const commonTeams = [
    'Manchester United', 'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea',
    'Barcelona', 'Real Madrid', 'Bayern Munich', 'PSG', 'Juventus',
    'Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics',
    'New York Yankees', 'Dallas Cowboys', 'New England Patriots'
  ];
  
  await Promise.all(commonTeams.map(team => getTeamLogo(team)));
  console.log('✅ Preloaded common team logos');
};

// Legacy class-based service for backward compatibility
class TeamLogoService {
  public getTeamLogo(teamName: string, teamBadge?: string): string | null {
    // If badge already exists, return it
    if (teamBadge && teamBadge.startsWith('http')) {
      return teamBadge;
    }
    
    // Check cache for pre-loaded logos
    const cacheKey = teamName?.toLowerCase().trim();
    if (cacheKey && logoCache.has(cacheKey)) {
      return logoCache.get(cacheKey) || null;
    }
    
    return null;
  }

  public enhanceMatchWithLogos(match: any): any {
    // Synchronous version - just returns cached logos if available
    if (!match.teams) return match;
    
    const homeLogoFromCache = match.teams.home?.name 
      ? logoCache.get(match.teams.home.name.toLowerCase().trim()) 
      : null;
    const awayLogoFromCache = match.teams.away?.name 
      ? logoCache.get(match.teams.away.name.toLowerCase().trim()) 
      : null;
    
    return {
      ...match,
      teams: {
        home: {
          ...match.teams.home,
          badge: match.teams.home?.badge || homeLogoFromCache || ''
        },
        away: {
          ...match.teams.away,
          badge: match.teams.away?.badge || awayLogoFromCache || ''
        }
      }
    };
  }
}

export const teamLogoService = new TeamLogoService();
export { TeamLogoService };
