import React from 'react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

interface GradientMatchCardProps {
  match: Match;
  className?: string;
  sportId?: string;
  isPriority?: boolean;
  onClick?: () => void;
  preventNavigation?: boolean;
}

const GradientMatchCard: React.FC<GradientMatchCardProps> = ({ 
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
    return format(date, 'MMM d');
  };

  // Use API poster URL
  const posterUrl = match.poster ? `https://streamed.pk/api/images/poster/${match.poster}.webp` : '';
  
  // Use badge for team images with streamed.pk API
  const homeBadge = match.teams?.home?.badge ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp` : '';
  const awayBadge = match.teams?.away?.badge ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp` : '';
  
  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasStream = match.sources?.length > 0;
  const hasTeamLogos = homeBadge && awayBadge;
  const hasTeams = !!home && !!away;
  const isLive = isMatchLive(match);
  
  // Get match title for display
  const getMatchTitle = () => {
    if (hasTeams) {
      return `${home} vs. ${away}`;
    }
    return match.title.replace(/([a-z])([A-Z][a-z])/g, '$1 $2').replace(/vs/gi, ' vs ').replace(/\s+/g, ' ').trim();
  };

  // Get league name from match
  const getLeagueInfo = () => {
    // Use category (sport type) as league info
    return match.category || 'Sport';
  };

  // Generate dynamic gradient colors based on match/sport
  const getGradientColors = () => {
    const gradients = [
      'from-blue-500 to-blue-700',      // Blue gradient
      'from-red-500 to-red-700',        // Red gradient  
      'from-purple-500 to-purple-700',  // Purple gradient
      'from-amber-500 to-amber-700',    // Yellow/amber gradient
      'from-green-500 to-green-700',    // Green gradient
      'from-pink-500 to-pink-700',      // Pink gradient
      'from-indigo-500 to-indigo-700',  // Indigo gradient
      'from-orange-500 to-orange-700',  // Orange gradient
    ];
    
    // Use match ID to consistently pick a gradient
    const index = match.id.length % gradients.length;
    return gradients[index];
  };

  const cardContent = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl bg-transparent border-0">
      <AspectRatio ratio={16/9} className="w-full">
        <div className="absolute inset-0 h-full">
          {/* Background with gradient or poster */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColors()}`}>
            {posterUrl && (
              <img 
                src={posterUrl}
                alt={getMatchTitle()}
                className="w-full h-full object-cover mix-blend-overlay opacity-30"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col h-full p-4">
            {/* Top section with team logos */}
            <div className="flex-1 flex items-center justify-center">
              {hasTeamLogos ? (
                <div className="flex items-center justify-center gap-4">
                  {/* Home team logo */}
                  <div className="flex flex-col items-center">
                    <img 
                      src={homeBadge} 
                      alt={home}
                      className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* League logo in center (Premier League logo from your reference) */}
                  <div className="flex flex-col items-center mx-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VS</span>
                    </div>
                  </div>

                  {/* Away team logo */}
                  <div className="flex flex-col items-center">
                    <img 
                      src={awayBadge} 
                      alt={away}
                      className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Fallback for matches without team logos */
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl font-bold">⚽</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom section with match info - dark overlay */}
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
              {/* Match title */}
              <h3 className="text-white font-bold text-sm md:text-base mb-1 leading-tight">
                {getMatchTitle()}
              </h3>
              
              {/* League and time info */}
              <div className="flex justify-between items-center text-white/80 text-xs md:text-sm">
                <span className="font-medium">{getLeagueInfo()}</span>
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  ) : (
                    <span>{formatDate(match.date)}, {formatTime(match.date)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
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

export default GradientMatchCard;