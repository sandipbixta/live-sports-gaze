import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock, Play, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

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

  // Generate thumbnail background
  const generateThumbnail = () => {
    const posterSports = ['cricket', 'wrestling', 'ufc', 'motorsport', 'golf', 'hockey'];
    const canUsePoster =
      posterSports.includes((sportId || match.sportId)?.toLowerCase()) &&
      match.poster &&
      !match.poster.includes('streamed.su');
    
    if (canUsePoster) {
      return (
        <img
          src={`https://streamed.pk${match.poster}.webp`}
          alt={match.title}
          className="w-full h-full object-cover"
        />
      );
    }

    // Default thumbnail with team badges
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
        {/* Background team badges */}
        {homeBadge && (
          <img
            src={homeBadge}
            alt={home || 'Home Team'}
            className="absolute left-1/4 top-1/2 -translate-y-1/2 w-20 h-20 opacity-10 blur-sm"
          />
        )}
        {awayBadge && (
          <img
            src={awayBadge}
            alt={away || 'Away Team'}
            className="absolute right-1/4 top-1/2 -translate-y-1/2 w-20 h-20 opacity-10 blur-sm"
          />
        )}
        
        {/* Teams display */}
        {home || away ? (
          <div className="flex items-center gap-3 z-10 relative">
            {homeBadge && (
              <img
                src={homeBadge}
                alt={home || 'Home Team'}
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="text-muted-foreground text-sm font-medium">VS</span>
            {awayBadge && (
              <img
                src={awayBadge}
                alt={away || 'Away Team'}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground">
            <Play className="w-8 h-8" />
          </div>
        )}
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