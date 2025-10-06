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
    <div className="group cursor-pointer hover-lift">
      {/* Thumbnail Section with modern card styling */}
      <div className="relative mb-3 card-modern overflow-hidden">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-2xl bg-gradient-dark">
          {generateThumbnail()}
          
          {/* Time badge - bottom left with glass effect */}
          <div className="absolute bottom-2 left-2">
            <Badge className="glass text-foreground px-2 py-1 text-xs font-medium border-0">
              <Clock className="w-3 h-3 mr-1" />
              {match.date ? formatTime(match.date) : 'TBD'}
            </Badge>
          </div>

          {/* Live status badge - bottom right with glow */}
          {isLive && (
            <div className="absolute bottom-2 right-2">
              <Badge className="bg-gradient-to-r from-destructive to-destructive/80 text-white px-3 py-1.5 text-xs font-bold animate-glow-pulse border-0">
                🔴 LIVE
              </Badge>
            </div>
          )}

          {/* Stream count overlay with gradient */}
          {hasStream && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white px-2.5 py-1 text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 border-0">
                <Play className="w-3 h-3" fill="currentColor" />
                <span>{match.sources.length}</span>
              </Badge>
            </div>
          )}
          
          {/* Priority badge for trending matches */}
          {isPriority && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-gradient-secondary text-white px-2 py-1 text-xs font-semibold border-0">
                ⭐ Trending
              </Badge>
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Content Section with improved spacing */}
      <div className="space-y-2.5 px-1">
        {/* Title with gradient on hover */}
        <h3 className="font-display font-semibold text-base line-clamp-2 text-foreground group-hover:gradient-text transition-all duration-300">
          {home && away ? `${home} vs ${away}` : match.title}
        </h3>
        
        {/* Subtitle */}
        <p className="text-xs text-muted-foreground/70 line-clamp-1 font-medium">
          {home && away ? `${home} vs ${away}` : match.title} on damitv.pro
        </p>

        {/* Metadata with icons */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {match.date ? formatFullDate(match.date) : 'Date TBD'}
          </div>
          
          {hasStream && (
            <>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" />
                {match.sources.length} stream{match.sources.length > 1 ? 's' : ''}
              </div>
            </>
          )}
        </div>

        {/* Status indicator with better styling */}
        <div className="text-xs flex items-center gap-2.5 pt-1">
          {isLive ? (
            <>
              <span className="text-destructive font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                Live now
              </span>
              <ViewerCount matchId={match.id} enableRealtime={true} />
            </>
          ) : match.date ? (
            <span className="text-muted-foreground font-medium">
              {match.date > Date.now() ? '📅 Upcoming' : '🏁 Ended'}
            </span>
          ) : (
            <span className="text-muted-foreground font-medium">📋 Scheduled</span>
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