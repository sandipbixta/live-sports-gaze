import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Match } from '@/types/sports';
import { isMatchLive } from '@/utils/matchUtils';
import { format } from 'date-fns';

interface BannerMatchCardProps {
  match: Match;
  streamAvailable: boolean;
}

const DAMITV_LOGO = 'https://i.imgur.com/WUguNZl.png';

// Fallback backgrounds (same as MatchCard)
const fallbackImages = [
  '/lovable-uploads/eea0415f-461e-4279-a1d2-06165804c368.png',
  'https://i.imgur.com/1xsz109.jpg',
  'https://i.imgur.com/sVc77ht.jpg',
  'https://i.imgur.com/1Tw0JRU.jpg',
  'https://i.imgur.com/MtYQroI.jpg',
  'https://i.imgur.com/EsEKzFs.jpg',
  'https://i.imgur.com/XT3MN8i.jpg',
];

const BannerMatchCard: React.FC<BannerMatchCardProps> = ({ match, streamAvailable }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'EEE, MMM d');
  };

  const isLive = isMatchLive(match);

  // Poster logic (same as MatchCard)
  const getPosterUrl = () => {
    if (!match.poster) return null;
    return `https://streamed.pk${match.poster}`;
  };

  const posterUrl = getPosterUrl();

  // Team badges
  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : null;
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : null;

  // Logic: poster → badge with overlay → damitv logo
  const hasPoster = !!posterUrl;
  const hasBadge = !posterUrl && (homeBadge || awayBadge);
  const useDamiLogo = !posterUrl && !homeBadge && !awayBadge;
  
  // Get consistent fallback background for badge cards
  const fallbackBg = fallbackImages[Math.abs(match.id?.toString().charCodeAt(0) || 0) % fallbackImages.length];

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasTeams = !!home && !!away;

  return (
    <div className="w-full">
      <div
        className="relative w-full h-48 md:h-64 overflow-hidden rounded-xl bg-gray-900"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      >
        {/* Background Image Logic (same as MatchCard) */}
        {/* 1. If poster exists → show poster */}
        {hasPoster && (
          <img src={posterUrl} alt={match.title} className="w-full h-full object-cover" />
        )}

        {/* 2. If no poster but badge exists → show badge with dark overlay */}
        {hasBadge && (
          <>
            {/* Fallback background image */}
            <img src={fallbackBg} alt="Background" className="w-full h-full object-cover" />
            
            {/* Team badges overlay for background only */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}

        {/* 3. If neither poster nor badge → fallback to DamiTV logo */}
        {useDamiLogo && (
          <img src={DAMITV_LOGO} alt="DamiTV" className="w-full h-full object-cover" />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-16 lg:space-x-20">
              {hasTeams ? (
                // Team-based layout
                <>
                  {/* Home team */}
                  <div className="flex flex-col items-center text-center">
                    {homeBadge ? (
                      <img 
                        src={homeBadge} 
                        alt={home} 
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-2 md:mb-3 object-contain rounded-lg bg-white/10 p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallbackDiv = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (fallbackDiv) {
                            fallbackDiv.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-2 md:mb-3 ${homeBadge ? 'hidden' : ''}`}
                      style={{ display: homeBadge ? 'none' : 'flex' }}
                    >
                      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{home.charAt(0)}</span>
                    </div>
                    <h2 className="text-sm md:text-lg lg:text-xl font-bold text-white">{home}</h2>
                  </div>
                  
                  {/* VS section */}
                  <div className="flex flex-col items-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">VS</div>
                    <div className="flex items-center space-x-2 text-gray-300 text-xs md:text-sm">
                      <span>{formatTime(match.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 text-xs md:text-sm mt-1">
                      <span>{formatDate(match.date)}</span>
                    </div>
                  </div>
                  
                  {/* Away team */}
                  <div className="flex flex-col items-center text-center">
                    {awayBadge ? (
                      <img 
                        src={awayBadge} 
                        alt={away} 
                        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-2 md:mb-3 object-contain rounded-lg bg-white/10 p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fallbackDiv = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (fallbackDiv) {
                            fallbackDiv.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-2 md:mb-3 ${awayBadge ? 'hidden' : ''}`}
                      style={{ display: awayBadge ? 'none' : 'flex' }}
                    >
                      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{away.charAt(0)}</span>
                    </div>
                    <h2 className="text-sm md:text-lg lg:text-xl font-bold text-white">{away}</h2>
                  </div>
                </>
              ) : (
                // Non-team content (e.g., motorsports)
                <div className="flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">{match.title}</h2>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-gray-300 text-sm md:text-base">
                      {formatTime(match.date)}
                    </div>
                    <div className="text-gray-300 text-sm md:text-base">
                      {formatDate(match.date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live badge */}
        {streamAvailable && (
          <Badge className="absolute top-4 right-4 bg-red-600 text-white text-sm px-3 py-1 font-medium animate-pulse">
            • LIVE NOW
          </Badge>
        )}
      </div>
    </div>
  );
};

export default BannerMatchCard;