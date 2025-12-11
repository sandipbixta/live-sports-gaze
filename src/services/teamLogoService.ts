// Re-export everything from sportsLogoService for backward compatibility
export {
  getTeamLogo,
  getTeamLogoSync,
  getLogoUrl,
  getLogoAsync,
  getSportIcon,
  searchTeam,
  searchEvent,
  enhanceMatchWithLogos,
  enhanceMatchesWithLogos,
  getLeagueInfo,
  searchPlayer,
  getLivescores,
  getHighlights,
  preloadPopularTeams,
} from './sportsLogoService';

// Legacy class-based service for backward compatibility
import { getTeamLogoSync, enhanceMatchWithLogos as enhanceMatch } from './sportsLogoService';

class TeamLogoService {
  public getTeamLogo(teamName: string, _existingBadge?: string): string | null {
    if (_existingBadge && _existingBadge.startsWith('http')) {
      return _existingBadge;
    }
    return getTeamLogoSync(teamName);
  }

  public enhanceMatchWithLogos(match: any): any {
    // Sync version - just returns existing data or null
    if (!match.teams) return match;
    
    const homeLogo = match.teams.home?.name ? getTeamLogoSync(match.teams.home.name) : null;
    const awayLogo = match.teams.away?.name ? getTeamLogoSync(match.teams.away.name) : null;
    
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
