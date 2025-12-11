import { useState, useEffect } from 'react';
import { getLogoUrl, getLogoAsync, getSportIcon } from '../services/sportsLogoService';

interface TeamLogoProps {
  teamName: string;
  sport?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallbackIcon?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const TeamLogo = ({ 
  teamName, 
  sport, 
  size = 'md', 
  className = '',
  showFallbackIcon = true 
}: TeamLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => getLogoUrl(teamName, sport));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!getLogoUrl(teamName, sport));

  useEffect(() => {
    // Reset state when team changes
    const directUrl = getLogoUrl(teamName, sport);
    setLogoUrl(directUrl);
    setError(false);
    
    if (directUrl) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    
    getLogoAsync(teamName, sport).then(url => {
      if (mounted) {
        setLogoUrl(url);
        setLoading(false);
      }
    });
    
    return () => { mounted = false; };
  }, [teamName, sport]);

  const sizeClass = sizeClasses[size];

  // Show logo if available
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

  // Loading state
  if (loading) {
    return (
      <div className={`${sizeClass} rounded-full bg-muted animate-pulse flex-shrink-0 ${className}`} />
    );
  }

  // Fallback: sport icon or letter
  if (showFallbackIcon && sport) {
    const icon = getSportIcon(sport);
    return (
      <div className={`${sizeClass} rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0 ${className}`}>
        {icon}
      </div>
    );
  }

  // Letter fallback
  return (
    <div className={`${sizeClass} rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs flex-shrink-0 ${className}`}>
      {teamName?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

export default TeamLogo;
