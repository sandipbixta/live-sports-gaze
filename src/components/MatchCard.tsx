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
      <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
        {/* Image Section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {generateThumbnail()}
          
          {/* Gradient Overlay for Better Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
            {isLive && (
              <Badge className="bg-red-600 text-white px-2.5 py-1 text-xs font-bold border-0 shadow-lg">
                ● LIVE
              </Badge>
            )}
            {hasStream && (
              <Badge className="bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 text-xs font-medium border border-border/50 ml-auto">
                <Play className="w-3 h-3 mr-1" />
                {match.sources.length}
              </Badge>
            )}
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="font-bold text-lg sm:text-xl text-white mb-2 line-clamp-2 drop-shadow-lg">
              {home && away ? `${home} vs ${away}` : match.title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-white/90">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                <span>{match.date ? formatTime(match.date) : 'TBD'}</span>
              </div>
              
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                <Calendar className="w-3 h-3" />
                <span>{match.date ? formatDateShort(match.date) : 'TBD'}</span>
              </div>

              {isLive && (
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                  <Users className="w-3 h-3 text-green-400" />
                  <ViewerCount matchId={match.id} enableRealtime={true} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section Below Image */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-1">
            Free live sports streaming on DAMITV
          </p>

          {hasStream && (
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-200 group/btn">
              <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              <span>Watch Now</span>
            </button>
          )}

          {!isLive && match.date && match.date > Date.now() && (
            <div className="text-xs text-muted-foreground text-center py-1">
              Upcoming Match
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