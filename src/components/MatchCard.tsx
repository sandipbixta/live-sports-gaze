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
  onClick?: () => void;
  preventNavigation?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  className = '', 
  sportId, 
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

  // Badge URLs
  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : '';
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : '';

  // Poster URL, but skip if from streamed.su
  const cleanPoster = match.poster && !match.poster.includes('streamed.su')
    ? `https://streamed.pk${match.poster}.webp`
    : null;

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  const content = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-card text-card-foreground rounded-xl">
      <AspectRatio ratio={16 / 10} className="w-full">
        {cleanPoster ? (
          // If we have a clean poster, display it as background
          <div className="relative w-full h-full">
            <img
              src={cleanPoster}
              alt={match.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute top-2 left-2 flex items-center gap-2">
              {isLive ? (
                <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 font-medium animate-pulse">
                  • LIVE
                </Badge>
              ) : (
                <Badge className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(match.date)}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          // Custom gradient fallback design
          <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col justify-between p-4">
            <div className="flex justify-between items-center">
              <img src={homeBadge} alt={home} className="w-12 h-12 object-contain" />
              <span className="text-white font-bold text-lg">VS</span>
              <img src={awayBadge} alt={away} className="w-12 h-12 object-contain" />
            </div>
            <div className="text-center text-white">
              <h3 className="font-bold text-lg truncate">{home} vs {away}</h3>
              <p className="text-sm opacity-90">{formatDate(match.date)} • {formatTime(match.date)}</p>
            </div>
            <div className="absolute top-2 left-2">
              {isLive ? (
                <Badge className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 font-medium animate-pulse">
                  • LIVE
                </Badge>
              ) : (
                <Badge className="bg-white/30 text-white text-xs px-2 py-0.5 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(match.date)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </AspectRatio>

      {/* Footer */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-border/60 bg-background">
        <div className="text-muted-foreground text-xs">
          {format(match.date, 'EEE, MMM d')} • {formatTime(match.date)}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Play className="w-3 h-3" />
            <span className="text-xs font-medium">
              {hasStream ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
            </span>
          </div>
          {hasStream && (
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </div>
    </Card>
  );

  if (preventNavigation || onClick) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={onClick}>
        {content}
      </div>
    );
  }

  if (hasStream) {
    return (
      <Link to={`/match/${sportId || match.sportId}/${match.id}`} className={`block ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

export default MatchCard;
