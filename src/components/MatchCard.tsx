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
  preventNavigation,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'EEEE, MMM d');
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

  // Sports that use poster
  const posterSports = ['cricket', 'wrestling', 'ufc', 'motorsport', 'golf', 'hockey'];
  const canUsePoster =
    posterSports.includes((sportId || match.sportId)?.toLowerCase()) &&
    match.poster &&
    !match.poster.includes('streamed.su');
  const posterUrl = canUsePoster ? `https://streamed.pk${match.poster}.webp` : null;

  const cardContent = posterUrl ? (
    // Poster Layout
    <Card className="overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-gray-900 text-white rounded-xl">
      <AspectRatio ratio={16 / 10} className="w-full relative">
        <img
          src={posterUrl}
          alt={match.title}
          className="w-full h-full object-cover"
        />
        {/* Overlay for title */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm font-semibold text-center">
          {match.title}
        </div>
      </AspectRatio>
    </Card>
  ) : (
    // Badge Layout
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-gray-900 text-white rounded-xl">
      <AspectRatio ratio={16 / 10} className="w-full">
        {/* Plain background */}
        <div className="absolute inset-0 bg-gray-900" />

        {/* BIG shadow badges */}
        {homeBadge && (
          <img
            src={homeBadge}
            alt={home || 'Home Team'}
            className="absolute left-1/4 top-1/2 -translate-y-1/2 w-40 h-40 opacity-20 blur-lg"
          />
        )}
        {awayBadge && (
          <img
            src={awayBadge}
            alt={away || 'Away Team'}
            className="absolute right-1/4 top-1/2 -translate-y-1/2 w-40 h-40 opacity-20 blur-lg"
          />
        )}

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col justify-between p-4 h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            {isLive ? (
              <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 font-medium animate-pulse">
                • LIVE
              </Badge>
            ) : (
              <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {match.date ? formatTime(match.date) : 'Time TBD'}
              </Badge>
            )}
          </div>

          {/* Teams Section */}
          {home || away ? (
            <div className="flex items-center justify-center gap-6">
              {/* Home */}
              <div className="flex flex-col items-center">
                {homeBadge && (
                  <img
                    src={homeBadge}
                    alt={home || 'Home Team'}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
                  />
                )}
                <span className="text-white text-sm font-semibold mt-1 text-center">
                  {home || 'Home Team'}
                </span>
              </div>

              {/* VS */}
              <span className="text-white font-bold text-lg md:text-xl">VS</span>

              {/* Away */}
              <div className="flex flex-col items-center">
                {awayBadge && (
                  <img
                    src={awayBadge}
                    alt={away || 'Away Team'}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-lg"
                  />
                )}
                <span className="text-white text-sm font-semibold mt-1 text-center">
                  {away || 'Away Team'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-white font-bold text-sm md:text-base">{match.title}</span>
            </div>
          )}

          {/* Match Time */}
          <div className="text-white/90 text-xs mt-2 text-center">
            {match.date ? `${formatDate(match.date)} • ${formatTime(match.date)}` : 'Time TBD'}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 text-white/90 text-xs">
            <div>
              {match.date ? `${format(match.date, 'EEE, MMM d')} • ${formatTime(match.date)}` : 'Time TBD'}
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
