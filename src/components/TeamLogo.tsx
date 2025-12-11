import { useState, useEffect } from 'react';
import { fetchTeamLogo } from '../services/weStreamService';

interface TeamLogoProps {
  teamName: string;
  badge?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  sport?: string;
  className?: string;
}

const SIZES = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const SPORT_ICONS: Record<string, string> = {
  football: '⚽', soccer: '⚽', basketball: '🏀', nba: '🏀',
  nfl: '🏈', hockey: '🏒', nhl: '🏒', baseball: '⚾', mlb: '⚾',
  tennis: '🎾', cricket: '🏏', rugby: '🏉', mma: '🥊', ufc: '🥊',
  boxing: '🥊', f1: '🏎️', motorsport: '🏎️', default: '🏆'
};

const TeamLogo = ({ teamName, badge, size = 'md', sport = 'default', className = '' }: TeamLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(badge || null);
  const [loading, setLoading] = useState(!badge);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (badge) {
      setLogoUrl(badge);
      setLoading(false);
      return;
    }

    const fetchLogo = async () => {
      setLoading(true);
      try {
        const url = await fetchTeamLogo(teamName);
        setLogoUrl(url);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (teamName) {
      fetchLogo();
    }
  }, [teamName, badge]);

  const sizeClass = SIZES[size];
  const sportKey = sport?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
  const sportIcon = SPORT_ICONS[sportKey] || SPORT_ICONS.default;

  if (loading) {
    return (
      <div className={`${sizeClass} ${className} bg-muted rounded-full animate-pulse flex-shrink-0`} />
    );
  }

  if (logoUrl && !error) {
    return (
      <img
        src={logoUrl}
        alt={teamName}
        className={`${sizeClass} ${className} object-contain flex-shrink-0`}
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${className} bg-muted rounded-full flex items-center justify-center text-foreground font-bold flex-shrink-0`}>
      {sport !== 'default' ? (
        <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}>
          {sportIcon}
        </span>
      ) : (
        <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>
          {teamName?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};

export default TeamLogo;
