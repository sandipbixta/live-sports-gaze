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
  onClick,
  preventNavigation
}) => {
  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

  const formatDate = (timestamp: number) =>
    format(new Date(timestamp), 'EEEE, MMM d');

  // Streamed API image URLs
  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : '';
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : '';
  const posterImage = match.poster
    ? `https://streamed.pk${match.poster}.webp`
    : (match.teams?.home?.badge && match.teams?.away?.badge
        ? `https://streamed.pk/api/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`
        : '');

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const hasTeams = !!home && !!away;
  const isLive = isMatchLive(match);

  const cardContent = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg rounded-xl">
      <AspectRatio ratio={16 / 10} className="relative w-full">
        {/* Poster Background */}
        {posterImage && (
          <img
            src={posterImage}
            alt={`${home} vs ${away}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Card Content */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
          {/* Top Section - Status */}
          <div className="flex justify-between items-center">
            {isLive ? (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 animate-pulse">
                • LIVE
              </Badge>
            ) : (
              <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(match.date)}
              </Badge>
            )}
          </div>

          {/* Middle Section - Teams */}
          {hasTeams && (
            <div className="flex items-center justify-center gap-6">
              {/* Home Team */}
              <div className="flex flex-col items-center">
                {homeBadge && (
                  <img
                    src={homeBadge}
                    alt={home}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <span className="mt-1 text-center text-xs md:text-sm font-semibold">
                  {home}
                </span>
              </div>

              {/* VS */}
              <span className="font-bold text-sm md:text-lg">VS</span>

              {/* Away Team */}
              <div className="flex flex-col items-center">
                {awayBadge && (
                  <img
                    src={awayBadge}
                    alt={away}
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <span className="mt-1 text-center text-xs md:text-sm font-semibold">
                  {away}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Section - Date & Streams */}
          <div className="flex justify-between items-center text-xs md:text-sm">
            <span>
              {format(match.date, 'EEE, MMM d')} • {formatTime(match.date)}
            </span>
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {hasStream
                ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}`
                : 'No streams'}
              {hasStream && (
                <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
              )}
            </div>
          </div>
        </div>
      </AspectRatio>
    </Card>
  );

  // Click handler
  const handleClick = () => {
    if (onClick) onClick();
  };

  // Navigation logic
  if (preventNavigation || onClick) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        {cardContent}
      </div>
    );
  }

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
