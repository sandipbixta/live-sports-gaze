import { useState, useEffect } from 'react';
import { fetchEventPoster, fetchTeamLogo } from '../services/weStreamService';
import TeamLogo from './TeamLogo';

interface MatchCardImageProps {
  poster?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeBadge?: string | null;
  awayBadge?: string | null;
  sport?: string;
  className?: string;
}

const SPORT_GRADIENTS: Record<string, string> = {
  football: 'from-green-900 to-green-950',
  soccer: 'from-green-900 to-green-950',
  basketball: 'from-orange-900 to-orange-950',
  nba: 'from-orange-900 to-orange-950',
  nfl: 'from-blue-900 to-blue-950',
  hockey: 'from-cyan-900 to-cyan-950',
  nhl: 'from-cyan-900 to-cyan-950',
  mma: 'from-red-900 to-red-950',
  ufc: 'from-red-900 to-red-950',
  f1: 'from-red-900 to-red-950',
  default: 'from-gray-800 to-gray-900'
};

const MatchCardImage = ({ 
  poster, 
  homeTeam, 
  awayTeam, 
  homeBadge, 
  awayBadge, 
  sport = 'default',
  className = ''
}: MatchCardImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(poster || null);
  const [homeLogo, setHomeLogo] = useState<string | null>(homeBadge || null);
  const [awayLogo, setAwayLogo] = useState<string | null>(awayBadge || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      
      if (!poster && homeTeam && awayTeam) {
        const eventPoster = await fetchEventPoster(homeTeam, awayTeam);
        if (eventPoster) {
          setImageUrl(eventPoster);
        }
      }
      
      if (!homeBadge && homeTeam) {
        const logo = await fetchTeamLogo(homeTeam);
        if (logo) setHomeLogo(logo);
      }
      
      if (!awayBadge && awayTeam) {
        const logo = await fetchTeamLogo(awayTeam);
        if (logo) setAwayLogo(logo);
      }
      
      setLoading(false);
    };

    fetchImages();
  }, [poster, homeTeam, awayTeam, homeBadge, awayBadge]);

  const sportKey = sport?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
  const gradient = SPORT_GRADIENTS[sportKey] || SPORT_GRADIENTS.default;

  if (loading) {
    return (
      <div className={`${className} bg-muted animate-pulse`} />
    );
  }

  if (imageUrl && !error) {
    return (
      <div className={`${className} relative overflow-hidden`}>
        <img
          src={imageUrl}
          alt={`${homeTeam} vs ${awayTeam}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
        }} />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center gap-4 p-4">
        <TeamLogo 
          teamName={homeTeam} 
          badge={homeLogo} 
          size="lg" 
          sport={sport} 
        />
        <span className="text-white/50 font-bold text-lg">VS</span>
        <TeamLogo 
          teamName={awayTeam} 
          badge={awayLogo} 
          size="lg" 
          sport={sport} 
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
};

export default MatchCardImage;
