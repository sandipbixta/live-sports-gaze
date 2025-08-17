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

const DAMITV_LOGO = 'https://i.imgur.com/WUguNZl.png';

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

  // Enhanced poster fetching logic - try multiple sources and formats
  const getPosterUrl = () => {
    if (!match.poster) return null;
    
    // If poster already starts with http, use it as is
    if (match.poster.startsWith('http')) {
      return match.poster;
    }
    
    // Try different combinations for relative paths
    const baseUrls = ['https://streamed.pk', 'https://streamed.su'];
    const formats = ['.webp', '.jpg', '.png', ''];
    
    for (const baseUrl of baseUrls) {
      for (const format of formats) {
        // Skip if format already exists in the path
        if (format && match.poster.includes(format)) continue;
        
        const url = `${baseUrl}${match.poster}${format}`;
        return url; // Return first attempt to test
      }
    }
    
    return `https://streamed.pk${match.poster}`;
  };

  const posterUrl = getPosterUrl();

  // Team badges (home/away) from API
  const homeBadge = match.teams?.home?.badge ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp` : null;
  const awayBadge = match.teams?.away?.badge ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp` : null;

  // Determine thumbnail logic
  const showSplit = !posterUrl && (homeBadge || awayBadge); // split only if no poster but badges exist
  const showDamiLogo = !posterUrl && !homeBadge && !awayBadge; // show full DamiTV logo if nothing else

  const cardContent = (
    <div className={`flex flex-col ${className} cursor-pointer group`}>
      <div
        className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-900"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      >
        {/* Poster exists */}
        {posterUrl && (
          <img
            src={posterUrl}
            alt={match.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Split half for badges */}
        {showSplit && (
          <div className="flex w-full h-full">
            <div className="w-1/2 h-full flex items-center justify-center bg-gray-800">
              {homeBadge && (
                <img
                  src={homeBadge}
                  alt={match.teams?.home?.name || 'Home'}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                />
              )}
            </div>
            <div className="w-1/2 h-full flex items-center justify-center bg-gray-800">
              {awayBadge && (
                <img
                  src={awayBadge}
                  alt={match.teams?.away?.name || 'Away'}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                />
              )}
            </div>
          </div>
        )}

        {/* Full DamiTV logo fallback */}
        {showDamiLogo && (
          <img
            src={DAMITV_LOGO}
            alt="DamiTV"
            className="w-full h-full object-cover"
          />
        )}

        {/* Live badge */}
        {isLive && (
          <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 font-medium animate-pulse">
            • LIVE
          </Badge>
        )}
      </div>

      {/* Content below thumbnail */}
      <div className="mt-2 flex flex-col gap-1">
        <h3 className="font-semibold text-sm md:text-base line-clamp-2 text-white">
          {match.title || `${match.teams?.home?.name || ''} vs ${match.teams?.away?.name || ''}`}
        </h3>
        <div className="text-gray-400 text-xs md:text-sm">
          {match.date ? `${formatDate(match.date)} • ${formatTime(match.date)}` : 'Time TBD'}
        </div>
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
