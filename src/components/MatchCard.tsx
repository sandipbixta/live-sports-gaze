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

// Fallback backgrounds (rotate randomly or assign based on match ID for consistency)
const fallbackImages = [
  'https://i.imgur.com/1xsz109.jpg',
  'https://i.imgur.com/sVc77ht.jpg',
  'https://i.imgur.com/1Tw0JRU.jpg',
  'https://i.imgur.com/MtYQroI.jpg',
  'https://i.imgur.com/EsEKzFs.jpg',
  'https://i.imgur.com/XT3MN8i.jpg',
];

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

  // Enhanced poster logic with multiple sources for football matches
  const getPosterUrl = () => {
    if (!match.poster && !match.id) return null;
    
    // If poster exists, try multiple base URLs
    if (match.poster) {
      const basePaths = [
        'https://streamed.pk',
        'https://streamed.su'
      ];
      
      for (const basePath of basePaths) {
        if (match.poster.startsWith('http')) {
          return match.poster;
        } else {
          return `${basePath}${match.poster}`;
        }
      }
    }
    
    // For football matches without posters, try to generate poster URLs
    if (match.sportId === 'football' || match.category === 'football') {
      const posterVariations = [
        `https://streamed.pk/api/images/poster/${match.id}.webp`,
        `https://streamed.su/api/images/poster/${match.id}.webp`,
        `https://streamed.pk/api/images/poster/${match.id}.jpg`,
        `https://streamed.su/api/images/poster/${match.id}.jpg`
      ];
      
      // Return the first variation for now (we'll handle failures in onError)
      return posterVariations[0];
    }
    
    return null;
  };

  const posterUrl = getPosterUrl();

  // Team badges
  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : null;
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : null;

  // Generate fallback background (based on match.id for consistency)
  const fallbackBg =
    fallbackImages[Math.abs(match.id?.toString().charCodeAt(0) || 0) % fallbackImages.length];

  const showBadgesOnFallback = !posterUrl && (homeBadge || awayBadge);
  const showDamiLogo = !posterUrl && !homeBadge && !awayBadge;

  const cardContent = (
    <div className={`flex flex-col ${className} cursor-pointer group`}>
      <div
        className="relative w-full aspect-video overflow-hidden rounded-xl bg-gray-900"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      >
        {/* Poster exists or attempted */}
        {posterUrl && (
          <img 
            src={posterUrl} 
            alt={match.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // If football poster fails, try alternative sources
              const currentSrc = (e.target as HTMLImageElement).src;
              const isFirstAttempt = currentSrc.includes('streamed.pk');
              
              if (isFirstAttempt && (match.sportId === 'football' || match.category === 'football')) {
                (e.target as HTMLImageElement).src = currentSrc.replace('streamed.pk', 'streamed.su');
              } else {
                // Hide failed image and show fallback
                (e.target as HTMLImageElement).style.display = 'none';
              }
            }}
          />
        )}

        {/* Background fallback with badges */}
        {showBadgesOnFallback && (
          <>
            {/* Fallback background */}
            <img src={fallbackBg} alt="Fallback" className="w-full h-full object-cover" />

            {/* Overlay badges with black-lite shadow */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full flex items-center justify-center bg-black/40">
                {homeBadge && (
                  <img
                    src={homeBadge}
                    alt={match.teams?.home?.name || 'Home'}
                    className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)]"
                  />
                )}
              </div>
              <div className="w-1/2 h-full flex items-center justify-center bg-black/40">
                {awayBadge && (
                  <img
                    src={awayBadge}
                    alt={match.teams?.away?.name || 'Away'}
                    className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)]"
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* Full DamiTV logo fallback */}
        {showDamiLogo && (
          <img src={DAMITV_LOGO} alt="DamiTV" className="w-full h-full object-cover" />
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
          {match.title ||
            `${match.teams?.home?.name || ''} vs ${match.teams?.away?.name || ''}`}
        </h3>
        <div className="text-gray-400 text-xs md:text-sm">
          {match.date
            ? `${formatDate(match.date)} • ${formatTime(match.date)}`
            : 'Time TBD'}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-gray-400 text-xs md:text-sm">
            <Play className="w-3 h-3" />
            <span>
              {hasStream
                ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}`
                : 'No streams'}
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
      <Link to={`/match/${sportId || match.sportId}/${match.id}`}>{cardContent}</Link>
    );
  }

  return <>{cardContent}</>;
};

export default MatchCard;
