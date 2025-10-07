import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock, Play, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';
import { teamLogoService } from '../services/teamLogoService';
import defaultTvLogo from '@/assets/default-tv-logo.jpg';
import { ViewerCount } from './ViewerCount';

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
  isPriority
}) => {
  const [countdown, setCountdown] = React.useState<string>('');
  const [isMatchStarting, setIsMatchStarting] = React.useState(false);

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

  // Calculate countdown for upcoming matches
  React.useEffect(() => {
    if (!match.date || match.date <= Date.now()) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const timeUntilMatch = match.date - now;

      if (timeUntilMatch <= 0) {
        setCountdown('');
        setIsMatchStarting(true);
        return;
      }

      const hours = Math.floor(timeUntilMatch / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilMatch % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilMatch % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setCountdown(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [match.date]);

  // Get team badges with fallbacks
  const getTeamBadge = (team: any) => {
    if (team?.badge) {
      return `https://streamed.pk/api/images/badge/${team.badge}.webp`;
    }
    // Try to get logo from team logo service
    const logoFromService = teamLogoService.getTeamLogo(team?.name || '', team?.badge);
    return logoFromService || '';
  };

  const homeBadge = getTeamBadge(match.teams?.home);
  const awayBadge = getTeamBadge(match.teams?.away);

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  // Generate thumbnail background with priority: poster > badges > default logo
  const generateThumbnail = () => {
    // Priority 1: Use API poster if available (as per API docs)
    if (match.poster && match.poster.trim() !== '') {
      const posterUrl = match.poster.startsWith('http') 
        ? match.poster 
        : `https://streamed.pk${match.poster}.webp`;
      
      return (
        <div className="w-full h-full relative">
          <img
            src={posterUrl}
            alt={match.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Poster failed to load for:', match.title, 'URL:', posterUrl);
              // Hide the image and show badge fallback
              const container = e.currentTarget.parentElement;
              if (container) {
                container.innerHTML = '';
                container.appendChild(createBadgeFallback());
              }
            }}
          />
        </div>
      );
    }

    // Helper function to create badge fallback
    const createBadgeFallback = () => {
      const div = document.createElement('div');
      div.innerHTML = badgeFallbackHTML();
      return div.firstElementChild as HTMLElement;
    };

    const badgeFallbackHTML = () => {
      if (homeBadge || awayBadge) {
        return badgeLayoutHTML();
      }
      return defaultImageHTML();
    };

    const badgeLayoutHTML = () => `
      <div class="w-full h-full relative overflow-hidden">
        ${getBackgroundImages()}
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="flex items-center gap-4 z-10 relative h-full justify-center">
          ${homeBadge ? badgeHTML(homeBadge, home || 'Home Team') : ''}
          <span class="text-white font-bold text-lg drop-shadow-sm">VS</span>
          ${awayBadge ? badgeHTML(awayBadge, away || 'Away Team') : ''}
        </div>
      </div>
    `;

    const getBackgroundImages = () => {
      const bgImages = [
        "https://i.imgur.com/1xsz109.jpg",
        "https://i.imgur.com/sVc77ht.jpg", 
        "https://i.imgur.com/1Tw0JRU.jpg",
        "https://i.imgur.com/MtYQroI.jpg",
        "https://i.imgur.com/EsEKzFs.jpg",
        "https://i.imgur.com/XT3MN8i.jpg"
      ];
      const bgIndex = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgImages.length;
      return `<div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style="background-image: url(${bgImages[bgIndex]})"></div><div class="absolute inset-0 bg-black/20"></div>`;
    };

    const badgeHTML = (badgeUrl: string, altText: string) => `
      <div class="flex flex-col items-center">
        <img 
          src="${badgeUrl}" 
          alt="${altText}" 
          class="w-14 h-14 object-contain drop-shadow-md filter brightness-110" 
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
        />
        <div class="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold" style="display:none;">
          ${altText.substring(0, 2).toUpperCase()}
        </div>
        <span class="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">${altText}</span>
      </div>
    `;

    const defaultImageHTML = () => {
      const bgImages = [
        "https://i.imgur.com/1xsz109.jpg",
        "https://i.imgur.com/sVc77ht.jpg", 
        "https://i.imgur.com/1Tw0JRU.jpg",
        "https://i.imgur.com/MtYQroI.jpg",
        "https://i.imgur.com/EsEKzFs.jpg",
        "https://i.imgur.com/XT3MN8i.jpg"
      ];
      const bgIndex = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgImages.length;
      return `
        <div class="w-full h-full relative overflow-hidden">
          <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url(${bgImages[bgIndex]})"></div>
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="absolute inset-0 flex items-center justify-center z-10">
            <span class="text-white font-bold text-2xl drop-shadow-lg tracking-wide">DAMITV</span>
          </div>
        </div>
      `;
    };

    // Priority 2: Use team badges with background images if available
    if (homeBadge || awayBadge) {
      // Background images array
      const badgeBackgroundImages = [
        "https://i.imgur.com/1xsz109.jpg",
        "https://i.imgur.com/sVc77ht.jpg", 
        "https://i.imgur.com/1Tw0JRU.jpg",
        "https://i.imgur.com/MtYQroI.jpg",
        "https://i.imgur.com/EsEKzFs.jpg",
        "https://i.imgur.com/XT3MN8i.jpg"
      ];
      
      // Select background based on match id for consistency
      const bgIndex = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % badgeBackgroundImages.length;
      const selectedBg = badgeBackgroundImages[bgIndex];

      return (
        <div className="w-full h-full relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${selectedBg})` }}
          />
          
          {/* Dark overlay for better contrast - reduced opacity */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Background team badges with blur */}
          {homeBadge && (
            <img
              src={homeBadge}
              alt={home || 'Home Team'}
              className="absolute left-1/4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-15 blur-lg"
              onError={(e) => {
                console.log('Home badge failed to load:', homeBadge);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {awayBadge && (
            <img
              src={awayBadge}
              alt={away || 'Away Team'}
              className="absolute right-1/4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-15 blur-lg"
              onError={(e) => {
                console.log('Away badge failed to load:', awayBadge);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          
          {/* Teams display with enhanced badges */}
          <div className="flex items-center gap-4 z-10 relative h-full justify-center">
            {homeBadge ? (
              <div className="flex flex-col items-center">
                <img
                  src={homeBadge}
                  alt={home || 'Home Team'}
                  className="w-14 h-14 object-contain drop-shadow-md filter brightness-110"
                  onError={(e) => {
                    console.log('Home team badge failed to load:', homeBadge);
                    // Show team initials fallback
                    const fallback = document.createElement('div');
                    fallback.className = 'w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold';
                    fallback.textContent = (home || 'HT').substring(0, 2).toUpperCase();
                    (e.target as HTMLImageElement).parentNode?.replaceChild(fallback, e.target as HTMLImageElement);
                  }}
                />
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {home || 'Home Team'}
                </span>
              </div>
            ) : home ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {home.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {home}
                </span>
              </div>
            ) : null}
            <span className="text-white font-bold text-lg drop-shadow-sm">VS</span>
            {awayBadge ? (
              <div className="flex flex-col items-center">
                <img
                  src={awayBadge}
                  alt={away || 'Away Team'}
                  className="w-14 h-14 object-contain drop-shadow-md filter brightness-110"
                  onError={(e) => {
                    console.log('Away team badge failed to load:', awayBadge);
                    // Show team initials fallback
                    const fallback = document.createElement('div');
                    fallback.className = 'w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold';
                    fallback.textContent = (away || 'AT').substring(0, 2).toUpperCase();
                    (e.target as HTMLImageElement).parentNode?.replaceChild(fallback, e.target as HTMLImageElement);
                  }}
                />
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {away || 'Away Team'}
                </span>
              </div>
            ) : away ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {away.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {away}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    // Priority 3: Use default image with DAMITV text for matches without logos/badges or posters
    const defaultBackgroundImages = [
      "https://i.imgur.com/1xsz109.jpg",
      "https://i.imgur.com/sVc77ht.jpg", 
      "https://i.imgur.com/1Tw0JRU.jpg",
      "https://i.imgur.com/MtYQroI.jpg",
      "https://i.imgur.com/EsEKzFs.jpg",
      "https://i.imgur.com/XT3MN8i.jpg"
    ];
    
    const bgIndex = match.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % defaultBackgroundImages.length;
    const selectedBg = defaultBackgroundImages[bgIndex];

    return (
      <div className="w-full h-full relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${selectedBg})` }}
        />
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/40" />
        {/* DAMITV Text */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-white font-bold text-2xl drop-shadow-lg tracking-wide">DAMITV</span>
        </div>
      </div>
    );
  };

  const cardContent = (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg border-2 border-white/5 bg-black transition-all duration-300 hover:border-primary">
        {/* Image Section */}
        <div className="relative aspect-video overflow-hidden bg-gray-900">
          {generateThumbnail()}
          
          {/* Simple Status Indicators */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
            {isLive ? (
              <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 tracking-wider">
                ● Live
              </span>
            ) : (
              <span className="bg-gray-800/90 text-white/60 text-[10px] font-bold uppercase px-2 py-1">
                {match.date && match.date > Date.now() ? 'Upcoming' : 'Ended'}
              </span>
            )}
            
            {hasStream && (
              <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1">
                {match.sources.length} HD
              </span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-bold text-white text-sm line-clamp-2 min-h-[2.5rem]">
            {home && away ? `${home} vs ${away}` : match.title}
          </h3>
          
          {/* Meta Info */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
            <span>{match.date ? formatTime(match.date) : 'TBD'}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{match.date ? formatDateShort(match.date) : 'TBD'}</span>
            {isLive && (
              <>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <ViewerCount matchId={match.id} enableRealtime={true} />
              </>
            )}
          </div>
          
          {/* Action */}
          {hasStream && (
            <div className="pt-1">
              {isLive || isMatchStarting ? (
                <div className="bg-white text-black font-bold text-xs py-2 text-center uppercase tracking-wide hover:bg-primary hover:text-white transition-colors">
                  Watch Now
                </div>
              ) : countdown ? (
                <div className="bg-gray-800 text-white border border-gray-700 font-bold text-xs py-2 text-center uppercase tracking-wide flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Starts in {countdown}
                </div>
              ) : null}
            </div>
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