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
    return format(date, 'MMM d');
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
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-2xl border-0 bg-gradient-to-br from-[#1a1f36] via-[#242850] to-[#2d3464] rounded-xl">
      <AspectRatio 
        ratio={16/9} 
        className="w-full h-full"
      >
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          {/* Header with Live/Time and Sport badges */}
          <div className="flex justify-between items-start">
            {isLive ? (
              <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-3 py-1.5 animate-pulse font-semibold rounded-full border-2 border-red-400">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
            ) : (
              <Badge className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 font-medium border border-white/20 rounded-full">
                <Clock className="w-3 h-3 mr-1.5" />
                {formatTime(match.date)}
              </Badge>
            )}
            
            <Badge className="bg-[#ff5a36] text-white text-xs px-3 py-1.5 font-semibold rounded-full shadow-lg">
              {match.sportId?.replace('-', ' ').toUpperCase() || 'SPORTS'}
            </Badge>
          </div>
          
          {/* Main Content - Teams or Title */}
          <div className="flex-1 flex items-center justify-center my-4">
            {hasTeams ? (
              <div className="flex items-center justify-center space-x-8 w-full">
                {/* Home Team */}
                <div className="flex flex-col items-center space-y-3 flex-1">
                  {hasTeamLogos ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center border-2 border-white/10 shadow-xl group-hover:border-white/30 transition-all duration-300">
                      <img 
                        src={homeBadge} 
                        alt={home}
                        className="w-14 h-14 object-contain filter group-hover:brightness-110 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {home.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border-2 border-white/10 group-hover:border-white/30 transition-all duration-300">
                      <span className="text-white text-xl font-bold">
                        {home.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-white text-sm font-semibold text-center leading-tight max-w-20 truncate">
                    {home}
                  </span>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-white/90 text-2xl font-bold tracking-wider">VS</div>
                  <div className="text-white/60 text-xs font-medium bg-white/5 px-2 py-1 rounded-full">
                    {formatDate(match.date)}
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center space-y-3 flex-1">
                  {hasTeamLogos ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center border-2 border-white/10 shadow-xl group-hover:border-white/30 transition-all duration-300">
                      <img 
                        src={awayBadge} 
                        alt={away}
                        className="w-14 h-14 object-contain filter group-hover:brightness-110 transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {away.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border-2 border-white/10 group-hover:border-white/30 transition-all duration-300">
                      <span className="text-white text-xl font-bold">
                        {away.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-white text-sm font-semibold text-center leading-tight max-w-20 truncate">
                    {away}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-white font-bold text-xl mb-2 leading-tight">{match.title}</h3>
                <p className="text-white/70 text-sm font-medium">{formatDate(match.date)}</p>
              </div>
            )}
          </div>

          {/* Footer with Stream Info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <Play className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm font-medium">
                  {hasStream ? `${match.sources.length} Stream${match.sources.length > 1 ? 's' : ''}` : 'No Streams'}
                </span>
              </div>
            </div>
            
            {hasStream && (
              <div className="flex items-center space-x-1 text-white/70 group-hover:text-[#ff5a36] transition-colors duration-300">
                <span className="text-sm font-semibold">Watch Now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            )}
          </div>

          {/* Hover overlay with gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a36]/0 via-[#ff5a36]/5 to-[#ff5a36]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          {/* Subtle border glow on hover */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#ff5a36]/30 transition-all duration-300 pointer-events-none" />
          
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
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