import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Match } from '../types/sports';
import { AspectRatio } from './ui/aspect-ratio';
import { Eye, Clock, Play } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { format } from 'date-fns';
import { Button } from './ui/button';

interface MatchCardProps {
  match: Match;
  sportId: string;
  isPriority?: boolean;
  onClick?: () => void;
  preventNavigation?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  sportId, 
  isPriority = false,
  onClick,
  preventNavigation = false
}) => {
  // Check if we're on mobile
  const isMobile = useIsMobile();
  
  // Helper function to determine if a match is likely live - Reduced to 3 hours
  const isMatchLive = (match: Match): boolean => {
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const threeHoursInMs = 3 * 60 * 60 * 1000; // Changed to 3 hours
    const oneHourInMs = 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      matchTime - now < oneHourInMs && // Match starts within 1 hour
      now - matchTime < threeHoursInMs  // Match can be live up to 3 hours after start
    );
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMM d');
  };

  const homeBadge = match.teams?.home?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
    : '';
  const awayBadge = match.teams?.away?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
    : '';
  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const hasTeamLogos = homeBadge && awayBadge;
  const hasTeams = !!home && !!away;
  const isLive = isMatchLive(match);
  
  // Create the content element that will be used inside either Link or div
  const cardContent = (
    <div className="relative rounded-md overflow-hidden h-full transition-all duration-300 group">
      <AspectRatio ratio={16/10} className="bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10"></div>
        
        {/* Match Time */}
        <div className="absolute top-1 left-1 z-20">
          <div className="bg-black/70 text-white px-1 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
            {!isLive && <Clock className="w-2.5 h-2.5" />}
            {formatTime(match.date)}
          </div>
        </div>
        
        {/* Live/Upcoming Badge - Adjusted for mobile */}
        <div className="absolute top-1 right-1 z-30">
          {isLive ? (
            <div className="flex items-center gap-1 bg-[#fa2d04] text-white px-1 py-0.5 rounded-md">
              <Eye className="w-2 h-2" />
              <span className="text-[8px] font-medium">LIVE</span>
            </div>
          ) : hasStream ? (
            <div className="flex items-center gap-1 bg-[#1EAEDB] text-white px-1 py-0.5 rounded-md">
              <Clock className="w-2 h-2" />
              <span className="text-[8px] font-medium">UPCOMING</span>
            </div>
          ) : null}
        </div>
        
        {/* Teams or DAMITV - Centered in the card */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-2">
          {hasTeamLogos && hasTeams ? (
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-14 h-14'} bg-white rounded-full flex items-center justify-center overflow-hidden`}>
                  <img 
                    src={homeBadge} 
                    alt={home} 
                    className={`${isMobile ? 'w-7 h-7' : 'w-12 h-12'} object-contain`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-xs">D</span></div>';
                    }}
                  />
                </div>
              </div>
              {/* Only show VS when both teams exist */}
              {hasTeams && (
                <div className="mx-2 text-white text-xs font-bold">VS</div>
              )}
              <div className="flex items-center">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-14 h-14'} bg-white rounded-full flex items-center justify-center overflow-hidden`}>
                  <img 
                    src={awayBadge} 
                    alt={away}
                    className={`${isMobile ? 'w-7 h-7' : 'w-12 h-12'} object-contain`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-xs">D</span></div>';
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="bg-[#343a4d] px-2 py-0.5 rounded-md">
                <span className="font-bold text-white text-[10px]">DAMITV</span>
              </div>
            </div>
          )}
          <h3 className="font-semibold text-center text-white text-[10px] md:text-xs truncate px-1 mt-2">
            {match.title.length > 20 ? `${match.title.substring(0, 20)}...` : match.title}
          </h3>
          <p className="text-center text-gray-300 text-[8px] md:text-[10px] truncate px-1">
            {match.title.split('-').pop()?.trim() || 'Football'}
          </p>
          
          {/* Add date for upcoming matches */}
          {!isLive && (
            <p className="text-center text-[#1EAEDB] text-[8px] md:text-[10px] mt-1">
              {formatDate(match.date)}
            </p>
          )}
          
          {/* Watch Now Button - appears on hover */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              className="w-full bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-medium py-1 text-xs flex items-center justify-center gap-1"
              size="sm"
            >
              <Play size={12} />
              Watch Now
            </Button>
          </div>
        </div>
      </AspectRatio>
    </div>
  );

  // Return either a Link or a div based on the preventNavigation prop
  if (preventNavigation) {
    return (
      <div 
        className="group block cursor-pointer" 
        onClick={onClick}
        key={`${isPriority ? 'popular-' : ''}${match.id}`}
      >
        {cardContent}
      </div>
    );
  }
  
  // Default behavior with Link navigation - use state to preserve navigation history
  return (
    <Link 
      to={`/match/${sportId}/${match.id}`}
      key={`${isPriority ? 'popular-' : ''}${match.id}`} 
      className="group block"
    >
      {cardContent}
    </Link>
  );
};

export default MatchCard;
