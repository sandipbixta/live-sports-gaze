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
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'EEEE, MMM d');
  };

  // Use badge for team images with streamed.pk API
  const homeBadge = match.teams?.home?.badge ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp` : '';
  const awayBadge = match.teams?.away?.badge ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp` : '';
  
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
        <div className="absolute inset-0 p-2 md:p-4 flex flex-col h-full">
          {/* Header with Live/Time badge */}
          <div className="flex justify-between items-center mb-2 md:mb-4">
            {isLive ? (
              <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] md:text-xs px-1.5 py-0.5 animate-pulse font-medium">
                • LIVE
              </Badge>
            ) : (
              <Badge className="bg-[#ff5a36] hover:bg-[#ff5a36] text-white text-[10px] md:text-xs px-1.5 py-0.5 font-medium">
                {formatTime(match.date)}
              </Badge>
            )}
            
            <Badge className="bg-white/10 text-white text-[10px] md:text-xs px-1.5 py-0.5 font-medium">
              {formatDate(match.date)}
            </Badge>
          </div>
          
          {/* Teams Section */}
          {hasTeams ? (
            <div className="flex items-stretch justify-between flex-1 min-h-0">
              {/* Home Team */}
              <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-0.5">
                {homeBadge && (
                  <img 
                    src={homeBadge} 
                    alt={home}
                    className="w-6 h-6 md:w-8 md:h-8 mb-1 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="text-white text-[10px] md:text-sm font-semibold text-center leading-tight w-full h-8 md:h-10 flex items-center justify-center">
                  <span className="line-clamp-2 break-words hyphens-auto">
                    {home}
                  </span>
                </div>
              </div>

              {/* VS Section */}
              <div className="flex flex-col items-center justify-center space-y-0.5 md:space-y-1 px-1.5 min-w-fit">
                <div className="text-white text-[10px] md:text-sm font-bold">VS</div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-0.5">
                {awayBadge && (
                  <img 
                    src={awayBadge} 
                    alt={away}
                    className="w-6 h-6 md:w-8 md:h-8 mb-1 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="text-white text-[10px] md:text-sm font-semibold text-center leading-tight w-full h-8 md:h-10 flex items-center justify-center">
                  <span className="line-clamp-2 break-words hyphens-auto">
                    {away}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* No Teams Available */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white font-bold text-[10px] md:text-sm mb-1 leading-tight">{match.title}</h3>
                <p className="text-white/60 text-[10px] md:text-xs">{formatDate(match.date)}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center space-x-1">
              <Play className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-[10px] md:text-xs font-medium">
                {hasStream ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
              </span>
            </div>
            
            {hasStream && (
              <div className="text-white/60 group-hover:text-[#ff5a36] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a36]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
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