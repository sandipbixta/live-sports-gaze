import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Play, ChevronRight } from 'lucide-react';
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

const FALLBACK_LOGO = 'https://i.imgur.com/WUguNZl.png';

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
    return format(date, 'EEE, MMM d');
  };

  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  // Poster URL if available and not from streamed.su
  const posterUrl =
    match.poster && !match.poster.includes('streamed.su')
      ? `https://streamed.pk${match.poster}.webp`
      : FALLBACK_LOGO;

  const cardContent = (
    <div className={`flex flex-col ${className} cursor-pointer group`}>
      {/* Poster / Thumbnail */}
      <div
        className="relative w-full h-48 md:h-40 overflow-hidden rounded-2xl"
        style={{
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)', // black shadow for corners
        }}
      >
        <img
          src={posterUrl}
          alt={match.title}
          className="w-full h-full object-cover"
        />
        {isLive && (
          <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 font-medium animate-pulse">
            • LIVE
          </Badge>
        )}
      </div>

      {/* Content below thumbnail */}
      <div className="mt-2 flex flex-col gap-1">
        {/* Match Title */}
        <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-white">
          {match.title || `${match.teams?.home?.name || ''} vs ${match.teams?.away?.name || ''}`}
        </h3>

        {/* Date and Time */}
        <div className="text-gray-400 text-xs md:text-sm">
          {match.date ? `${formatDate(match.date)} • ${formatTime(match.date)}` : 'Time TBD'}
        </div>

        {/* Streams Info */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs md:text-sm">
            <Play className="w-3 h-3" />
            <span>
              {hasStream ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
            </span>
          </div>
          {hasStream && (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </div>
      </div>
    </div>
  );

  if (preventNavigation || onClick) {
    return <div onClick={onClick}>{cardContent}</div>;
  }

  if (hasStream) {
    return (
      <Link to={`/match/${sportId || match.sportId}/${match.id}`}>
        {cardContent}
      </Link>
    );
  }

  return <>{cardContent}</>;
};

export default MatchCard;
