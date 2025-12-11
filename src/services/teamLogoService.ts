// Re-export everything from sportsLogoService for backward compatibility
export {
  getLogoUrl as getTeamLogoUrl,
  getLogoAsync as getTeamLogo,
  getLogoUrl as getTeamLogoSync,
  getSportIcon,
  getLogoUrl,
  getLogoAsync,
} from './sportsLogoService';

// Also import for use in legacy functions
import { getLogoAsync, getLogoUrl } from './sportsLogoService';

// Legacy exports for backward compatibility
export const enhanceMatchWithLogos = async (match: any) => {
  const homeTeam = match.teams?.home?.name || '';
  const awayTeam = match.teams?.away?.name || '';
  const sport = match.category || match.sportId || '';

  const [homeBadge, awayBadge] = await Promise.all([
    getLogoAsync(homeTeam, sport),
    getLogoAsync(awayTeam, sport)
  ]);

  return {
    ...match,
    teams: {
      home: { ...match.teams?.home, badge: match.teams?.home?.badge || homeBadge },
      away: { ...match.teams?.away, badge: match.teams?.away?.badge || awayBadge }
    }
  };
};

export const enhanceMatchesWithLogos = async (matches: any[]) => {
  return Promise.all(matches.map(enhanceMatchWithLogos));
};

// Legacy class-based service for backward compatibility
class TeamLogoService {
  public getTeamLogo(teamName: string, _existingBadge?: string): string | null {
    if (_existingBadge && _existingBadge.startsWith('http')) {
      return _existingBadge;
    }
    return getLogoUrl(teamName);
  }

  public enhanceMatchWithLogos(match: any): any {
    if (!match.teams) return match;
    
    const homeLogo = match.teams.home?.name ? getLogoUrl(match.teams.home.name) : null;
    const awayLogo = match.teams.away?.name ? getLogoUrl(match.teams.away.name) : null;
    
    return {
      ...match,
      teams: {
        home: { ...match.teams.home, badge: match.teams.home?.badge || homeLogo || '' },
        away: { ...match.teams.away, badge: match.teams.away?.badge || awayLogo || '' }
      }
    };
  }
}

export const teamLogoService = new TeamLogoService();
export { TeamLogoService };
