import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock, Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

interface MatchCardProps {
  match: Match;
  className?: string;
  sportId?: string;
  isPriority?: boolean;
  onClick?: () => void;
  preventNavigation?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  className = '', 
  sportId, 
  isPriority, 
  onClick, 
  preventNavigation 
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMM d');
  };

  // Prioritize logo over badge for team images
  const homeBadge = match.teams?.home?.logo || 
    (match.teams?.home?.badge ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` : '');
  const awayBadge = match.teams?.away?.logo || 
    (match.teams?.away?.badge ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` : '');
  
  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const hasTeamLogos = homeBadge && awayBadge;
  const hasTeams = !!home && !!away;
  const isLive = isMatchLive(match);
  
  // Create the content element that will be used inside either Link or div
  const cardContent = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg border-0 bg-gradient-to-br from-[#242836] to-[#1a1f2e] rounded-xl">
      <AspectRatio 
        ratio={16/10} 
        className="w-full"
      >
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Header with Live/Time badge */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              {/* Live/Upcoming Badge - Adjusted for mobile */}
              {isLive ? (
                <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-2 py-1 animate-pulse">
                  • LIVE
                </Badge>
              ) : (
                <Badge className="bg-[#ff5a36] hover:bg-[#ff5a36] text-white text-xs px-2 py-1">
                  {formatTime(match.date)}
                </Badge>
              )}
            </div>
            
            <Badge className="bg-[#343a4d] text-white text-xs px-2 py-1">
              {match.sportId?.replace('-', ' ').toUpperCase() || 'SPORTS'}
            </Badge>
          </div>
          
          {/* Teams Section */}
          {hasTeams && (
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 flex-1">
              {/* Home Team */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1">
                {hasTeamLogos ? (
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    <img 
                      src={homeBadge} 
                      alt={home}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {home.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {home.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-white text-xs sm:text-sm font-medium text-center leading-tight line-clamp-2">
                  {home}
                </span>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center space-y-1">
                <div className="text-white/60 text-xs sm:text-sm font-bold">VS</div>
                <div className="text-white/40 text-xs">{formatDate(match.date)}</div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1">
                {hasTeamLogos ? (
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    <img 
                      src={awayBadge} 
                      alt={away}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {away.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">
                      {away.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-white text-xs sm:text-sm font-medium text-center leading-tight line-clamp-2">
                  {away}
                </span>
              </div>
            </div>
          )}

          {/* No Teams Available */}
          {!hasTeams && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">{match.title}</h3>
                <p className="text-white/60 text-xs">{formatDate(match.date)}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-1">
              <Play className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">
                {hasStream ? `${match.sources.length} source${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
              </span>
            </div>
            
            {hasStream && (
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a36]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </AspectRatio>
    </Card>
  );

  // Handle click and navigation logic
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // If preventNavigation is true or onClick is provided, make it a clickable div
  if (preventNavigation || onClick) {
    return (
      <div 
        className={`cursor-pointer ${className}`}
        onClick={handleClick}
      >
        {cardContent}
      </div>
    );
  }

  // If there are streams, make it a Link; otherwise just show the card
  if (hasStream) {
    return (
      <Link 
        to={`/match/${sportId || match.sportId}/${match.id}`} 
        className={`block ${className}`}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className={className}>{cardContent}</div>;
};

export default MatchCard;