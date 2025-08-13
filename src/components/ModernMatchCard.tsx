import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

interface ModernMatchCardProps {
  match: Match;
  className?: string;
  sportId?: string;
  isPriority?: boolean;
  onClick?: () => void;
  preventNavigation?: boolean;
}

const ModernMatchCard: React.FC<ModernMatchCardProps> = ({ 
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
  const isLive = isMatchLive(match);
  
  // Clean up the title by removing "poster" word
  const cleanTitle = match.title.replace(/\s*poster\s*/gi, '').replace(/([a-z])([A-Z][a-z])/g, '$1 $2').replace(/vs/gi, ' vs ').replace(/\s+/g, ' ').trim();
  
  // Generate gradient colors based on match category/sport
  const getGradientForSport = (category: string) => {
    const gradients = {
      football: 'from-blue-500 to-blue-700',
      basketball: 'from-orange-500 to-orange-700', 
      tennis: 'from-green-500 to-green-700',
      soccer: 'from-emerald-500 to-emerald-700',
      baseball: 'from-red-500 to-red-700',
      hockey: 'from-cyan-500 to-cyan-700',
      default: 'from-purple-500 to-purple-700'
    };
    
    return gradients[category as keyof typeof gradients] || gradients.default;
  };

  // Create the content element
  const cardContent = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-card text-card-foreground rounded-xl">
      <div className="flex flex-col h-full">
        <AspectRatio 
          ratio={16/9} 
          className="w-full"
        >
          <div className={`relative h-full w-full bg-gradient-to-br ${getGradientForSport(match.category)} p-4 flex items-center justify-center`}>
            {/* Live Badge - Top Right */}
            <div className="absolute top-3 right-3">
              {isLive && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-medium animate-pulse">
                  • LIVE
                </Badge>
              )}
            </div>

            {/* Team Logos */}
            <div className="flex items-center justify-center gap-6">
              {/* Home Team */}
              {homeBadge && (
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <img
                    src={homeBadge}
                    alt={`${home} logo`}
                    className="w-full h-full object-contain"
                    loading={isPriority ? 'eager' : 'lazy'}
                  />
                </div>
              )}

              {/* VS Text */}
              <div className="text-white/80 font-bold text-sm md:text-base">VS</div>

              {/* Away Team */}
              {awayBadge && (
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full p-2 backdrop-blur-sm">
                  <img
                    src={awayBadge}
                    alt={`${away} logo`}
                    className="w-full h-full object-contain"
                    loading={isPriority ? 'eager' : 'lazy'}
                  />
                </div>
              )}
            </div>
          </div>
        </AspectRatio>

        {/* Bottom info bar */}
        <div className="px-4 py-3 border-t border-border bg-background/70">
          <div className="mb-1">
            <h3 className="text-foreground font-bold text-sm md:text-lg leading-tight">{cleanTitle}</h3>
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium">
              {match.category?.charAt(0).toUpperCase() + match.category?.slice(1)}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(match.date)}, {formatTime(match.date)}</span>
            </div>
          </div>
        </div>
      </div>
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

export default ModernMatchCard;