import { useState, useEffect } from 'react';
import { searchTeam, searchEvent, getSportIcon, getSportImage } from '../services/sportsLogoService';

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
      searchEvent(homeTeam, awayTeam).then(data => {
        if (data) setEventPoster(data.thumb || data.banner || data.poster);
      });
    }

    // Fetch team logos if not provided
    if (!homeBadge && homeTeam) {
      searchTeam(homeTeam).then(data => {
        if (data) setHomeLogo(data.badge || data.logo);
      });
    }
    if (!awayBadge && awayTeam) {
      searchTeam(awayTeam).then(data => {
        if (data) setAwayLogo(data.badge || data.logo);
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

  // DamiTV fallback with sport image
  const sportImage = getSportImage(sport || 'soccer');
  
  return (
    <div className="relative w-full h-40 overflow-hidden">
      {sportImage ? (
        <>
          <img src={sportImage} alt={sport || 'Sport'} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-muted" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">{getSportIcon(sport || 'sports')}</div>
          <h3 className="text-xl font-bold text-white drop-shadow-lg">DAMITV</h3>
          <p className="text-white/70 text-xs">Live Sports</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCardImage;
