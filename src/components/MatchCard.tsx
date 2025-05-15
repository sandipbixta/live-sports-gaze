
import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../types/sports';
import { AspectRatio } from './ui/aspect-ratio';
import { Eye } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  sportId: string;
  isPriority?: boolean;
  onClick?: () => void;  // New prop for handling clicks inline
  preventNavigation?: boolean; // New prop to prevent navigation
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  sportId, 
  isPriority = false,
  onClick,
  preventNavigation = false
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const homeBadge = match.teams?.home?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
    : '';
  const awayBadge = match.teams?.away?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
    : '';
  const home = match.teams?.home?.name || 'Team A';
  const away = match.teams?.away?.name || 'Team B';
  const hasStream = match.sources?.length > 0;
  const hasTeamLogos = homeBadge && awayBadge;
  
  // Create the content element that will be used inside either Link or div
  const cardContent = (
    <div className="relative rounded-md overflow-hidden h-full transition-all duration-300">
      <AspectRatio ratio={16/10} className="bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10"></div>
        
        {/* Match Time */}
        <div className="absolute top-1 left-1 z-20">
          <div className="bg-black/70 text-white px-1 py-0.5 rounded-full text-[10px] font-semibold">
            {formatTime(match.date)}
          </div>
        </div>
        
        {/* Streaming Badge - Updated color */}
        {hasStream && (
          <div className="absolute top-1 right-1 z-20">
            <div className="flex items-center gap-1 bg-[#fa2d04] text-white px-1 py-0.5 rounded-md">
              <Eye className="w-2 h-2" />
              <span className="text-[8px] font-medium">LIVE</span>
            </div>
          </div>
        )}
        
        {/* Teams or DAMITV */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-1 flex flex-col">
          {hasTeamLogos ? (
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={homeBadge} 
                    alt={home} 
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-[10px]">D</span></div>';
                    }}
                  />
                </div>
              </div>
              <div className="mx-2 text-white text-xs font-medium">vs</div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={awayBadge} 
                    alt={away} 
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-[10px]">D</span></div>';
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
          <h3 className="font-semibold text-center text-white text-[10px] md:text-xs truncate px-1 mt-1">
            {match.title.length > 20 ? `${match.title.substring(0, 20)}...` : match.title}
          </h3>
          <p className="text-center text-gray-300 text-[8px] md:text-[10px] truncate px-1">
            {match.title.split('-').pop()?.trim() || 'Football'}
          </p>
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
  
  // Default behavior with Link navigation
  return (
    <Link to={`/match/${sportId}/${match.id}`} key={`${isPriority ? 'popular-' : ''}${match.id}`} className="group block">
      {cardContent}
    </Link>
  );
};

export default MatchCard;
