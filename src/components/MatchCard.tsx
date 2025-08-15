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

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  const content = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-card text-card-foreground rounded-xl">
      <AspectRatio ratio={16 / 10} className="w-full">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600" />

        {/* BIG shadow badges */}
        {homeBadge && (
          <img
            src={homeBadge}
            alt={home}
            className="absolute left-1/4 top-1/2 -translate-y-1/2 w-40 h-40 opacity-20 blur-lg"
          />
        )}
        {awayBadge && (
          <img
            src={awayBadge}
            alt={away}
            className="absolute right-1/4 top-1/2 -translate-y-1/2 w-40 h-40 opacity-20 blur-lg"
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-4 h-full">
          {/* Header */}
          <div className="flex justify-between items-center">
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

          {/* Teams */}
          <div className="flex items-center justify-center gap-6">
            {/* Home */}
            <div className="flex flex-col items-center">
              {homeBadge && (
                <img
                  src={homeBadge}
                  alt={home}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
                />
              )}
              <span className="text-white text-sm font-semibold mt-1 text-center">
                {home}
              </span>
            </div>

            {/* VS */}
            <span className="text-white font-bold text-lg md:text-xl">VS</span>

            {/* Away */}
            <div className="flex flex-col items-center">
              {awayBadge && (
                <img
                  src={awayBadge}
                  alt={away}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
                />
              )}
              <span className="text-white text-sm font-semibold mt-1 text-center">
                {away}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 text-white/90 text-xs">
            <div>
              {format(match.date, 'EEE, MMM d')} • {formatTime(match.date)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>
                  {hasStream ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
                </span>
              </div>
              {hasStream && (
                <ChevronRight className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
              )}
            </div>
          </div>
        </div>
      </AspectRatio>
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
