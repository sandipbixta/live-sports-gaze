import { useState, useEffect } from 'react';
import { getTeamLogoSync, getTeamLogo } from '../services/teamLogoService';

interface TeamLogoProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
};

const TeamLogo = ({ teamName, size = 'md', className = '' }: TeamLogoProps) => {
  // Try sync first (instant from hardcoded IDs)
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getTeamLogoSync(teamName));
  const [error, setError] = useState(false);

  useEffect(() => {
    // If sync worked, done
    if (logoUrl) return;
    
    // Otherwise try async (TheSportsDB fallback)
    let mounted = true;
    getTeamLogo(teamName).then(url => {
      if (mounted && url) setLogoUrl(url);
    });
    return () => { mounted = false; };
  }, [teamName, logoUrl]);

  const sizeClass = sizeClasses[size];

  // Show logo
  if (logoUrl && !error) {
    return (
      <img
        src={logoUrl}
        alt={teamName}
        className={`${sizeClass} object-contain flex-shrink-0 ${className}`}
        onError={() => setError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: letter in circle
  return (
    <div className={`${sizeClass} rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs flex-shrink-0 ${className}`}>
      {teamName?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

export default TeamLogo;
