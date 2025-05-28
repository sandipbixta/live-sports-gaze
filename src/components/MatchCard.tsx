
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Match } from '../types/sports';
import { AspectRatio } from './ui/aspect-ratio';
import { Eye, Clock } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { format } from 'date-fns';

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
  
  // Softer color combinations for different cards
  const colorCombinations = [
    { home: 'from-blue-400 to-blue-500', away: 'from-slate-400 to-slate-500' },
    { home: 'from-emerald-400 to-emerald-500', away: 'from-purple-400 to-purple-500' },
    { home: 'from-orange-400 to-orange-500', away: 'from-indigo-400 to-indigo-500' },
    { home: 'from-teal-400 to-teal-500', away: 'from-rose-400 to-rose-500' },
    { home: 'from-cyan-400 to-cyan-500', away: 'from-amber-400 to-amber-500' },
    { home: 'from-green-400 to-green-500', away: 'from-pink-400 to-pink-500' },
    { home: 'from-violet-400 to-violet-500', away: 'from-lime-400 to-lime-500' },
    { home: 'from-sky-400 to-sky-500', away: 'from-red-400 to-red-500' },
  ];
  
  // Get color combination based on match ID hash
  const getColorCombination = (matchId: string) => {
    let hash = 0;
    for (let i = 0; i < matchId.length; i++) {
      const char = matchId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % colorCombinations.length;
    return colorCombinations[index];
  };
  
  const colors = getColorCombination(match.id);
  
  // Helper function to determine if a match is likely live
  const isMatchLive = (match: Match): boolean => {
    // A match is considered live if it has sources AND the match time is within 2 hours of now
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      Math.abs(matchTime - now) < twoHoursInMs
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
    <div className="relative rounded-md overflow-hidden h-full transition-all duration-300 group hover:scale-105">
      <AspectRatio ratio={16/10} className="bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Full background design for teams with logos */}
        {hasTeamLogos && hasTeams ? (
          <div className="absolute inset-0 flex">
            {/* Home team side */}
            <div className={`w-1/2 bg-gradient-to-br ${colors.home} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-white rounded-full flex items-center justify-center overflow-hidden mb-1 shadow-lg`}>
                  <img 
                    src={homeBadge} 
                    alt={home} 
                    className={`${isMobile ? 'w-7 h-7' : 'w-10 h-10'} object-contain`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-xs">H</span></div>';
                    }}
                  />
                </div>
                <span className="text-white text-[8px] md:text-[10px] font-semibold text-center leading-tight">
                  {home.length > 8 ? `${home.substring(0, 8)}...` : home}
                </span>
              </div>
            </div>
            
            {/* Away team side */}
            <div className={`w-1/2 bg-gradient-to-bl ${colors.away} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-white rounded-full flex items-center justify-center overflow-hidden mb-1 shadow-lg`}>
                  <img 
                    src={awayBadge} 
                    alt={away}
                    className={`${isMobile ? 'w-7 h-7' : 'w-10 h-10'} object-contain`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-xs">A</span></div>';
                    }}
                  />
                </div>
                <span className="text-white text-[8px] md:text-[10px] font-semibold text-center leading-tight">
                  {away.length > 8 ? `${away.substring(0, 8)}...` : away}
                </span>
              </div>
            </div>
            
            {/* VS circle in the center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                <span className="text-gray-800 text-[8px] md:text-[10px] font-bold">VS</span>
              </div>
            </div>
          </div>
        ) : (
          // Fallback for non-team matches
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-[#343a4d] px-2 py-0.5 rounded-md">
                  <span className="font-bold text-white text-[10px]">DAMITV</span>
                </div>
              </div>
              <h3 className="font-semibold text-center text-white text-[10px] md:text-xs truncate px-1">
                {match.title.length > 20 ? `${match.title.substring(0, 20)}...` : match.title}
              </h3>
              <p className="text-center text-gray-300 text-[8px] md:text-[10px] truncate px-1">
                {match.title.split('-').pop()?.trim() || 'Football'}
              </p>
            </div>
          </div>
        )}
        
        {/* Match Time */}
        <div className="absolute top-1 left-1 z-30">
          <div className="bg-black/70 text-white px-1 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
            {!isLive && <Clock className="w-2.5 h-2.5" />}
            {formatTime(match.date)}
          </div>
        </div>
        
        {/* Live/Upcoming Badge */}
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
        
        {/* Match title and date at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 z-20">
          <h3 className="font-semibold text-center text-white text-[10px] md:text-xs truncate">
            {match.title.length > 25 ? `${match.title.substring(0, 25)}...` : match.title}
          </h3>
          {!isLive && (
            <p className="text-center text-[#1EAEDB] text-[8px] md:text-[10px] mt-1">
              {formatDate(match.date)}
            </p>
          )}
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
