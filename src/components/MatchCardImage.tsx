import { useState, useEffect } from 'react';
import { getTeamBadge, getEventPoster, getSportIcon, getSportThumbnail } from '../services/sportsImageService';

interface MatchCardImageProps {
  poster?: string | null;
  homeTeam: string;
  awayTeam: string;
  sport?: string;
  homeBadge?: string | null;
  awayBadge?: string | null;
}

const MatchCardImage = ({ poster, homeTeam, awayTeam, sport, homeBadge, awayBadge }: MatchCardImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [eventPoster, setEventPoster] = useState<string | null>(poster || null);
  const [homeLogo, setHomeLogo] = useState<string | null>(homeBadge || null);
  const [awayLogo, setAwayLogo] = useState<string | null>(awayBadge || null);

  useEffect(() => {
    // Fetch event poster if not provided
    if (!poster && homeTeam && awayTeam) {
      getEventPoster(homeTeam, awayTeam).then(posterUrl => {
        if (posterUrl) setEventPoster(posterUrl);
      });
    }

    // Fetch team logos if not provided
    if (!homeBadge && homeTeam) {
      getTeamBadge(homeTeam).then(badge => {
        if (badge) setHomeLogo(badge);
      });
    }
    if (!awayBadge && awayTeam) {
      getTeamBadge(awayTeam).then(badge => {
        if (badge) setAwayLogo(badge);
      });
    }
  }, [homeTeam, awayTeam, poster, homeBadge, awayBadge]);

  // Show poster if available
  if ((poster || eventPoster) && !imageError) {
    return (
      <div className="relative w-full h-40 overflow-hidden">
        <img
          src={poster || eventPoster || ''}
          alt={`${homeTeam} vs ${awayTeam}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Show team logos side by side
  if (homeLogo || awayLogo) {
    return (
      <div className="relative w-full h-40 bg-gradient-to-br from-muted via-background to-muted/50 flex items-center justify-center gap-4 p-4">
        <div className="flex-1 flex justify-center">
          {homeLogo ? (
            <img src={homeLogo} alt={homeTeam} className="w-14 h-14 md:w-16 md:h-16 object-contain" />
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center text-foreground text-xl font-bold">
              {homeTeam?.charAt(0) || '?'}
            </div>
          )}
        </div>
        
        <div className="text-2xl">{getSportIcon(sport || 'sports')}</div>
        
        <div className="flex-1 flex justify-center">
          {awayLogo ? (
            <img src={awayLogo} alt={awayTeam} className="w-14 h-14 md:w-16 md:h-16 object-contain" />
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center text-foreground text-xl font-bold">
              {awayTeam?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // DamiTV fallback
  return (
    <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 via-background to-muted flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">{getSportIcon(sport || 'sports')}</div>
        <h3 className="text-xl font-bold text-foreground">DAMITV</h3>
        <p className="text-muted-foreground text-xs">Live Sports</p>
      </div>
    </div>
  );
};

export default MatchCardImage;
