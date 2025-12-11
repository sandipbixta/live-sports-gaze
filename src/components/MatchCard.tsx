import React, { useRef, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock, Play, Users, Calendar, Tv, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';
import { getTeamLogo } from '../services/teamLogoService';
import { sportsDbService } from '../services/sportsDbService';
import { ViewerCount } from './ViewerCount';
import { LiveViewerCount } from './LiveViewerCount';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [countdown, setCountdown] = useState<string>('');
  const [isMatchStarting, setIsMatchStarting] = useState(false);
  const [sportsDbPoster, setSportsDbPoster] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [fetchedHomeBadge, setFetchedHomeBadge] = useState<string | null>(null);
  const [fetchedAwayBadge, setFetchedAwayBadge] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';

  // Lazy load - only fetch poster when card is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fetch poster and team logos from TheSportsDB when visible
  useEffect(() => {
    if (!isVisible) return;

    const fetchData = async () => {
      // Fetch poster if not exists
      if (!match.poster && home && away) {
        try {
          const event = await sportsDbService.searchEvent(home, away);
          const poster = sportsDbService.getEventPoster(event, 'medium');
          if (poster) setSportsDbPoster(poster);
        } catch (error) {
          // Silent fail
        }
      }

      // Fetch team logos if not provided in match data
      if (home && !match.teams?.home?.badge) {
        const logo = await getTeamLogo(home);
        if (logo) setFetchedHomeBadge(logo);
      }
      
      if (away && !match.teams?.away?.badge) {
        const logo = await getTeamLogo(away);
        if (logo) setFetchedAwayBadge(logo);
      }
    };

    fetchData();
  }, [isVisible, match.poster, home, away, match.teams?.home?.badge, match.teams?.away?.badge]);

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

      // Format: "10h : 31m" or "46m : 50s"
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setCountdown(`${days}d : ${remainingHours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h : ${minutes.toString().padStart(2, '0')}m`);
      } else {
        setCountdown(`${minutes}m : ${seconds.toString().padStart(2, '0')}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [match.date]);

  // Get team badge - prioritize match data, then fetched data
  const getTeamBadge = (team: any, fetchedBadge: string | null) => {
    // Check badge from match data first
    if (team?.badge) {
      if (team.badge.startsWith('http')) {
        return team.badge;
      }
      return `https://api.cdn-live.tv/api/v1/team/images/${team.badge}`;
    }
    
    // Check logo from match data
    if (team?.logo) {
      if (team.logo.startsWith('http')) {
        return team.logo;
      }
      return `https://api.cdn-live.tv/api/v1/team/images/${team.logo}`;
    }
    
    // Use fetched badge from TheSportsDB
    return fetchedBadge || '';
  };

  const homeBadge = getTeamBadge(match.teams?.home, fetchedHomeBadge);
  const awayBadge = getTeamBadge(match.teams?.away, fetchedAwayBadge);

  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  // Generate thumbnail background with priority: poster > sportsDbPoster > badges > default
  const generateThumbnail = () => {
    // Priority 1: Use API poster or SportsDB poster if available
    const posterToUse = match.poster || sportsDbPoster;
    
    if (posterToUse && posterToUse.trim() !== '') {
      const posterUrl = posterToUse.startsWith('http') 
        ? posterToUse 
        : `https://api.cdn-live.tv${posterToUse}`;
      
      return (
        <div className="w-full h-full relative bg-black">
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
      <div class="w-full h-full relative overflow-hidden bg-black">
        <div class="flex items-center gap-4 z-10 relative h-full justify-center">
          ${homeBadge ? badgeHTML(homeBadge, home || 'Home Team') : ''}
          <span class="text-white font-bold text-lg drop-shadow-sm">VS</span>
          ${awayBadge ? badgeHTML(awayBadge, away || 'Away Team') : ''}
        </div>
      </div>
    `;

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
      return `
        <div class="w-full h-full relative overflow-hidden bg-black">
          <div class="absolute inset-0 flex items-center justify-center z-10">
            <span class="text-white font-bold text-2xl drop-shadow-lg tracking-wide">DAMITV</span>
          </div>
        </div>
      `;
    };

    // Priority 2: Use team badges with plain black background if available
    if (homeBadge || awayBadge) {
      return (
        <div className="w-full h-full relative overflow-hidden bg-black">
          
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

    // Priority 3: Use plain black background with DAMITV text for matches without logos/badges or posters
    return (
      <div className="w-full h-full relative overflow-hidden bg-black">
        {/* DAMITV Text */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-white font-bold text-2xl drop-shadow-lg tracking-wide">DAMITV</span>
        </div>
      </div>
    );
  };

  const cardContent = (
    <div ref={cardRef} className="group cursor-pointer h-full">
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:opacity-90 h-full flex flex-col">
        {/* Banner Image Section - 16:9 aspect ratio */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl flex-shrink-0">
          {generateThumbnail()}
          
          {/* FREE Badge - Top left */}
          {hasStream && !isLive && !isMatchStarting && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                FREE
              </span>
            </div>
          )}
          
          {/* LIVE Badge - Top right */}
          {(isLive || isMatchStarting) && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded animate-pulse">
                ● LIVE
              </span>
            </div>
          )}
          
          {!isLive && !isMatchStarting && countdown && (
            <div className="absolute bottom-2 left-2 z-10">
              <div className="bg-[hsl(16,100%,60%)] text-white text-[10px] font-bold py-1 px-2.5 rounded italic tracking-wide">
                WATCH IN {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-3 flex flex-col gap-2 flex-1 bg-card">
          {/* Sport • Tournament */}
          <p className="text-xs text-muted-foreground truncate">
            {match.category || 'Sports'} • {match.tournament || match.title}
          </p>
          
          {/* Team 1 */}
          <div className="flex items-center gap-2">
            {homeBadge ? (
              <img 
                src={homeBadge} 
                alt={home} 
                className="w-5 h-5 object-contain rounded-full"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[8px] font-bold text-muted-foreground">{home.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <span className="text-sm font-medium text-foreground truncate">{home || 'Team 1'}</span>
          </div>
          
          {/* Team 2 */}
          <div className="flex items-center gap-2">
            {awayBadge ? (
              <img 
                src={awayBadge} 
                alt={away} 
                className="w-5 h-5 object-contain rounded-full"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[8px] font-bold text-muted-foreground">{away.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <span className="text-sm font-medium text-foreground truncate">{away || 'Team 2'}</span>
          </div>
          
          {/* Match Start Time */}
          <p className="text-xs text-muted-foreground mt-auto">
            {isLive ? (
              <LiveViewerCount match={match} size="sm" />
            ) : match.date ? (
              `Match Starts at ${format(new Date(match.date), 'EEE, do MMM, h:mm a')}`
            ) : (
              'Time TBD'
            )}
          </p>
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
      <Link to={`/match/${sportId || match.sportId || match.category}/${match.id}`} className={`block ${className}`}>
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
};

export default MatchCard;