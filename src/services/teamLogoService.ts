// Team logo service using direct image URLs (no API calls = no rate limits!)

// Map team names to Football-Data.org team IDs (direct URLs, instant loading)
const TEAM_IDS: Record<string, number> = {
  // Premier League
  'arsenal': 57,
  'aston villa': 58,
  'bournemouth': 1044,
  'brentford': 402,
  'brighton': 397,
  'chelsea': 61,
  'crystal palace': 354,
  'everton': 62,
  'fulham': 63,
  'ipswich': 349,
  'leicester': 338,
  'liverpool': 64,
  'manchester city': 65,
  'manchester united': 66,
  'newcastle': 67,
  'newcastle united': 67,
  'nottingham forest': 351,
  'southampton': 340,
  'tottenham': 73,
  'tottenham hotspur': 73,
  'west ham': 563,
  'wolves': 76,
  'wolverhampton': 76,
  
  // La Liga
  'athletic bilbao': 77,
  'atletico madrid': 78,
  'barcelona': 81,
  'celta vigo': 558,
  'getafe': 82,
  'girona': 298,
  'las palmas': 275,
  'leganes': 745,
  'mallorca': 89,
  'osasuna': 79,
  'rayo vallecano': 87,
  'real betis': 90,
  'real madrid': 86,
  'real sociedad': 92,
  'sevilla': 559,
  'valencia': 95,
  'valladolid': 250,
  'villarreal': 94,
  
  // Bundesliga
  'augsburg': 16,
  'bayern munich': 5,
  'bayern': 5,
  'bochum': 36,
  'borussia dortmund': 4,
  'dortmund': 4,
  'eintracht frankfurt': 19,
  'frankfurt': 19,
  'freiburg': 17,
  'heidenheim': 44,
  'hoffenheim': 2,
  'holstein kiel': 720,
  'rb leipzig': 721,
  'leipzig': 721,
  'mainz': 28,
  'gladbach': 18,
  'borussia monchengladbach': 18,
  'st. pauli': 20,
  'st pauli': 20,
  'stuttgart': 10,
  'union berlin': 28,
  'werder bremen': 12,
  'wolfsburg': 11,
  
  // Serie A
  'ac milan': 98,
  'milan': 98,
  'atalanta': 102,
  'bologna': 103,
  'cagliari': 104,
  'como': 5890,
  'empoli': 749,
  'fiorentina': 99,
  'genoa': 107,
  'inter': 108,
  'inter milan': 108,
  'juventus': 109,
  'lazio': 110,
  'lecce': 5911,
  'monza': 5935,
  'napoli': 113,
  'parma': 112,
  'roma': 100,
  'torino': 586,
  'udinese': 115,
  'venezia': 454,
  'verona': 450,
  
  // Ligue 1
  'angers': 532,
  'auxerre': 519,
  'brest': 512,
  'le havre': 541,
  'lens': 546,
  'lille': 521,
  'lyon': 523,
  'marseille': 516,
  'monaco': 548,
  'montpellier': 518,
  'nantes': 543,
  'nice': 522,
  'psg': 524,
  'paris saint-germain': 524,
  'reims': 547,
  'rennes': 529,
  'saint-etienne': 527,
  'strasbourg': 576,
  'toulouse': 511,
};

// Normalize team name for lookup
const normalizeTeamName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/fc$/i, '')
    .replace(/^fc /i, '')
    .replace(/ fc$/i, '')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .trim();
};

// Get logo URL directly (no API call!)
export const getTeamLogoUrl = (teamName: string): string | null => {
  if (!teamName) return null;
  
  const normalized = normalizeTeamName(teamName);
  const teamId = TEAM_IDS[normalized];
  
  if (teamId) {
    return `https://crests.football-data.org/${teamId}.png`;
  }
  
  return null;
};

// Async version with fallback to TheSportsDB (only if direct URL fails)
export const getTeamLogo = async (teamName: string): Promise<string | null> => {
  // First try direct URL (instant, no API call)
  const directUrl = getTeamLogoUrl(teamName);
  if (directUrl) return directUrl;
  
  // Fallback: try localStorage cache
  const cacheKey = `logo_${normalizeTeamName(teamName)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached || null;
  } catch (e) {
    // localStorage not available
  }
  
  // Last resort: TheSportsDB API (rate limited, use sparingly)
  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams?.[0]) {
        const logoUrl = data.teams[0].strBadge || data.teams[0].strLogo || '';
        try {
          localStorage.setItem(cacheKey, logoUrl);
        } catch (e) {
          // localStorage not available
        }
        return logoUrl || null;
      }
    }
  } catch (e) {
    console.warn('Logo fetch failed for:', teamName);
  }
  
  try {
    localStorage.setItem(cacheKey, '');
  } catch (e) {
    // localStorage not available
  }
  return null;
};

// Sync version - instant return, no API
export const getTeamLogoSync = (teamName: string): string | null => {
  return getTeamLogoUrl(teamName);
};

// Enhance match with team logos (async)
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

// Legacy class-based service for backward compatibility
class TeamLogoService {
  public getTeamLogo(teamName: string, _existingBadge?: string): string | null {
    // If existing badge is provided and valid, return it
    if (_existingBadge && _existingBadge.startsWith('http')) {
      return _existingBadge;
    }
    
    // Try sync lookup
    return getTeamLogoSync(teamName);
  }

  public enhanceMatchWithLogos(match: any): any {
    // Synchronous version - just returns with sync logos
    if (!match.teams) return match;
    
    const homeLogo = match.teams.home?.name 
      ? getTeamLogoSync(match.teams.home.name) 
      : null;
    const awayLogo = match.teams.away?.name 
      ? getTeamLogoSync(match.teams.away.name) 
      : null;
    
    return {
      ...match,
      teams: {
        home: {
          ...match.teams.home,
          badge: match.teams.home?.badge || homeLogo || ''
        },
        away: {
          ...match.teams.away,
          badge: match.teams.away?.badge || awayLogo || ''
        }
      }
    };
  }
}

export const teamLogoService = new TeamLogoService();
export { TeamLogoService };
