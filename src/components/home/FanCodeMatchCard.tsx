import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { CombinedMatch, fetchTeamLogo, fetchEventPoster, getSportIcon } from '@/services/combinedSportsService';

interface Props {
  match: CombinedMatch;
}

const FanCodeMatchCard = ({ match }: Props) => {
  const [homeLogo, setHomeLogo] = useState<string | null>(match.homeBadge);
  const [awayLogo, setAwayLogo] = useState<string | null>(match.awayBadge);
  const [poster, setPoster] = useState<string | null>(match.poster);
  const [imageError, setImageError] = useState(false);
  
  const sportIcon = getSportIcon(match.sport);

  // Fetch logos and poster from TheSportsDB if not available
  useEffect(() => {
    const fetchImages = async () => {
      // Fetch team logos
      if (!homeLogo && match.homeTeam && match.homeTeam !== 'TBD') {
        const logo = await fetchTeamLogo(match.homeTeam);
        if (logo) setHomeLogo(logo);
      }
      if (!awayLogo && match.awayTeam && match.awayTeam !== 'TBD') {
        const logo = await fetchTeamLogo(match.awayTeam);
        if (logo) setAwayLogo(logo);
      }
      // Fetch event poster
      if (!poster && match.homeTeam && match.awayTeam) {
        const eventPoster = await fetchEventPoster(match.homeTeam, match.awayTeam);
        if (eventPoster) setPoster(eventPoster);
      }
    };
    fetchImages();
  }, [match.homeTeam, match.awayTeam, homeLogo, awayLogo, poster]);

  const formatTime = () => {
    if (match.isLive) return null;
    const now = new Date();
    const matchDate = match.date;
    
    // Today
    if (matchDate.toDateString() === now.toDateString()) {
      return matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (matchDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Don't show cards with TBD teams
  if (match.homeTeam === 'TBD' && match.awayTeam === 'TBD') {
    return null;
  }

  return (
    <Link
      to={`/match/${match.sport}/${match.id}`}
      className="group bg-card rounded-2xl overflow-hidden hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 border border-border/50"
    >
      {/* Event Poster/Thumbnail */}
      <div className="relative h-28 bg-gradient-to-br from-secondary via-card to-muted overflow-hidden">
        {poster && !imageError ? (
          <img 
            src={poster} 
            alt={match.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          /* Fallback: Team logos side by side */
          <div className="w-full h-full flex items-center justify-center gap-3 p-4">
            {homeLogo ? (
              <img 
                src={homeLogo} 
                alt={match.homeTeam} 
                className="w-12 h-12 object-contain"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground font-bold text-lg">
                {match.homeTeam?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-muted-foreground font-bold text-sm">VS</span>
            {awayLogo ? (
              <img 
                src={awayLogo} 
                alt={match.awayTeam} 
                className="w-12 h-12 object-contain"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground font-bold text-lg">
                {match.awayTeam?.charAt(0) || '?'}
              </div>
            )}
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        
        {/* Live Badge or Time */}
        {match.isLive ? (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-destructive-foreground rounded-full animate-pulse" />
            LIVE
          </div>
        ) : (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            {formatTime()}
          </div>
        )}
        
        {/* Sport Icon */}
        <div className="absolute top-2 right-2 text-lg" style={{ display: match.isLive ? 'block' : 'none' }}>
          {sportIcon}
        </div>
        
        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40">
          <div className="bg-destructive rounded-full p-2.5">
            <Play className="w-5 h-5 text-destructive-foreground fill-current" />
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="p-3">
        {/* Sport & Competition */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">{sportIcon}</span>
          <span className="text-muted-foreground text-xs truncate">
            {match.competition || match.sport.charAt(0).toUpperCase() + match.sport.slice(1)}
          </span>
        </div>
        
        {/* Teams with logos and scores */}
        <div className="space-y-1.5">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {homeLogo ? (
                <img src={homeLogo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-foreground text-xs flex-shrink-0">
                  {match.homeTeam?.charAt(0)}
                </div>
              )}
              <span className="text-foreground text-sm font-medium truncate">
                {match.homeTeam}
              </span>
            </div>
            {match.isLive && match.score && (
              <span className="text-foreground font-bold text-sm tabular-nums ml-2">{match.score.home}</span>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {awayLogo ? (
                <img src={awayLogo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-foreground text-xs flex-shrink-0">
                  {match.awayTeam?.charAt(0)}
                </div>
              )}
              <span className="text-muted-foreground text-sm truncate">
                {match.awayTeam}
              </span>
            </div>
            {match.isLive && match.score && (
              <span className="text-foreground font-bold text-sm tabular-nums ml-2">{match.score.away}</span>
            )}
          </div>
        </div>
      </div>

      {/* Watch Button (on hover) */}
      <div className="px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-primary-foreground text-sm font-semibold py-2 rounded-xl">
          <Play className="w-4 h-4 fill-current" />
          Watch Now
        </div>
      </div>
    </Link>
  );
};

export default FanCodeMatchCard;
