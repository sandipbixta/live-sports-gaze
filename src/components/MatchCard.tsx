import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock, Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

interface MatchCardProps {
  match: Match;
  className?: string;
  sportId?: string;
  isPriority?: boolean;
  onClick?: () => void;
  preventNavigation?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  className = '', 
  sportId, 
  isPriority, 
  onClick, 
  preventNavigation 
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'EEEE, MMM d');
  };

  // Use badge for team images with streamed.pk API
  const homeBadge = match.teams?.home?.badge ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp` : '';
  const awayBadge = match.teams?.away?.badge ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp` : '';
  
  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const hasTeamLogos = homeBadge && awayBadge;
  const hasTeams = !!home && !!away;
  const isLive = isMatchLive(match);
  const backgroundImage = match.poster;
  const showPosterBackground = !!backgroundImage;
  
  // Create the content element that will be used inside either Link or div
  const cardContent = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-card text-card-foreground rounded-xl">
      <AspectRatio 
        ratio={16/10} 
        className="w-full"
      >
        <div className="absolute inset-0 p-2 md:p-4 flex flex-col h-full">
          {showPosterBackground && (
            <>
              <img
                src={backgroundImage!}
                alt={`${match.title} poster`}
                className="absolute inset-0 w-full h-full object-cover scale-105"
                loading={isPriority ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/10 backdrop-blur-[1px]" />
            </>
          )}
          {/* Header with Live/Time badge */}
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <div className="flex items-center gap-2">
              {isLive ? (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] md:text-xs px-1.5 py-0.5 font-medium animate-pulse">
                  • LIVE
                </Badge>
              ) : (
                <Badge className="bg-secondary text-secondary-foreground text-[10px] md:text-xs px-1.5 py-0.5 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(match.date)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Unified Title Overlay (WWE-style) */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-1 max-w-[85%]">
              <h3 className="text-foreground font-bold text-xs md:text-base leading-tight">
                <span className="px-2.5 py-1 rounded-md bg-background/60 backdrop-blur-[2px]">
                  {match.title.replace(/([a-z])([A-Z][a-z])/g, '$1 $2').replace(/vs/gi, ' vs ').replace(/\s+/g, ' ').trim()}
                </span>
              </h3>
              <p className="text-muted-foreground text-[10px] md:text-xs">
                <span className="px-2 py-0.5 rounded bg-background/50 backdrop-blur-[2px]">
                  {formatDate(match.date)} • {formatTime(match.date)}
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/60">
            <div className="text-muted-foreground text-[10px] md:text-xs">
              {format(match.date, 'EEE, MMM d')} • {formatTime(match.date)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Play className="w-3 h-3" />
                <span className="text-[10px] md:text-xs font-medium">
                  {hasStream ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
                </span>
              </div>
              {hasStream && (
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
          </div>

        </div>
      </AspectRatio>
    </Card>
  );

  // Handle click and navigation logic
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // If preventNavigation is true or onClick is provided, make it a clickable div
  if (preventNavigation || onClick) {
    return (
      <div 
        className={`cursor-pointer ${className}`}
        onClick={handleClick}
      >
        {cardContent}
      </div>
    );
  }

  // If there are streams, make it a Link; otherwise just show the card
  if (hasStream) {
    return (
      <Link 
        to={`/match/${sportId || match.sportId}/${match.id}`} 
        className={`block ${className}`}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
};

export default MatchCard;