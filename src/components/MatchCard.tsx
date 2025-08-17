import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock, Play, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';
import defaultTvLogo from '@/assets/default-tv-logo.jpg';

interface MatchCardProps {
  match: Match;
  className?: string;
  sportId?: string;
  onClick?: () => void;
  preventNavigation?: boolean;
  isPriority?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  className = '',
  sportId,
  onClick,
  preventNavigation,
  isPriority,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateShort = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d');
  };

  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  };

  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : '';
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : '';

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  // Generate thumbnail background with priority: poster > badges > default logo
  const generateThumbnail = () => {
    // Priority 1: Use API poster if available (as per API docs)
    if (match.poster) {
      return (
        <img
          src={`https://streamed.pk${match.poster}.webp`}
          alt={match.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      );
    }

    // Priority 2: Use team badges with background images if available
    if (homeBadge || awayBadge) {
      // Background images array
      const backgroundImages = [
        "https://i.imgur.com/1xsz109.jpg",
        "https://i.imgur.com/sVc77ht.jpg", 
        "https://i.imgur.com/1Tw0JRU.jpg",
        "https://i.imgur.com/MtYQroI.jpg",
        "https://i.imgur.com/EsEKzFs.jpg",
        "https://i.imgur.com/XT3MN8i.jpg"
      ];
      
      // Select background based on match id for consistency
      const bgIndex = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % backgroundImages.length;
      const selectedBg = backgroundImages[bgIndex];

      return (
        <div className="w-full h-full relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${selectedBg})` }}
          />
          
          {/* Dark overlay for better contrast */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Background team badges with blur */}
          {homeBadge && (
            <img
              src={homeBadge}
              alt={home || 'Home Team'}
              className="absolute left-1/4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-15 blur-lg"
            />
          )}
          {awayBadge && (
            <img
              src={awayBadge}
              alt={away || 'Away Team'}
              className="absolute right-1/4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-15 blur-lg"
            />
          )}
          
          {/* Teams display with enhanced badges */}
          <div className="flex items-center gap-4 z-10 relative h-full justify-center">
            {homeBadge && (
              <div className="flex flex-col items-center">
                <img
                  src={homeBadge}
                  alt={home || 'Home Team'}
                  className="w-14 h-14 object-contain drop-shadow-md filter brightness-110"
                />
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {home || 'Home Team'}
                </span>
              </div>
            )}
            <span className="text-white font-bold text-lg drop-shadow-sm">VS</span>
            {awayBadge && (
              <div className="flex flex-col items-center">
                <img
                  src={awayBadge}
                  alt={away || 'Away Team'}
                  className="w-14 h-14 object-contain drop-shadow-md filter brightness-110"
                />
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {away || 'Away Team'}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Priority 3: Use default image for matches without logos/badges or posters
    return (
      <div className="w-full h-full relative overflow-hidden">
        <img
          src="https://i.imgur.com/47knf0G.jpg"
          alt="Live Stream"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-lg drop-shadow-md">
            {match.title}
          </span>
        </div>
      </div>
    );
  };

  const cardContent = (
    <div className="group cursor-pointer">
      {/* Thumbnail Section */}
      <div className="relative mb-3">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-muted">
          {generateThumbnail()}
          
          {/* Duration/Status badge */}
          <div className="absolute bottom-2 right-2">
            {isLive ? (
              <Badge className="bg-destructive text-destructive-foreground px-2 py-1 text-xs font-medium animate-pulse">
                LIVE
              </Badge>
            ) : (
              <Badge className="bg-background/80 text-foreground px-2 py-1 text-xs font-medium backdrop-blur-sm">
                {match.date ? formatTime(match.date) : 'Scheduled'}
              </Badge>
            )}
          </div>

          {/* Stream count overlay */}
          {hasStream && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-background/80 text-foreground px-2 py-1 text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                <Play className="w-3 h-3" />
                {match.sources.length}
              </Badge>
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Content Section */}
      <div className="space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {home && away ? `${home} vs ${away}` : match.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {match.date ? formatFullDate(match.date) : 'Date TBD'}
          </div>
          
          {hasStream && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {match.sources.length} stream{match.sources.length > 1 ? 's' : ''}
              </div>
            </>
          )}
        </div>

        {/* Status indicator */}
        <div className="text-xs">
          {isLive ? (
            <span className="text-destructive font-medium">Live now</span>
          ) : match.date ? (
            <span className="text-muted-foreground">
              {match.date > Date.now() ? 'Upcoming' : 'Ended'}
            </span>
          ) : (
            <span className="text-muted-foreground">Scheduled</span>
          )}
        </div>
      </div>
    </div>
  );

  if (preventNavigation || onClick) {
    return (
      <div className={className} onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  if (hasStream) {
    return (
      <Link to={`/match/${sportId || match.sportId}/${match.id}`} className={`block ${className}`}>
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
};

export default MatchCard;