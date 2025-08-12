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
  const hasTeams = !!home && !!away;
  const isLive = isMatchLive(match);
  const backgroundImage = match.poster;
  
  // Create sport-specific poster URL as fallback
  const getSportPosterUrl = (sportId: string, category: string) => {
    const sport = category || sportId || 'football';
    return `https://streamed.pk/api/images/sport/${sport}.webp`;
  };
  
  // Debug logging for poster data
  console.log('MatchCard Debug:', {
    matchId: match.id,
    title: match.title,
    poster: match.poster,
    category: match.category,
    sportId: match.sportId
  });
  
  // Clean up the title by removing "poster" word
  const cleanTitle = match.title.replace(/\s*poster\s*/gi, '').replace(/([a-z])([A-Z][a-z])/g, '$1 $2').replace(/vs/gi, ' vs ').replace(/\s+/g, ' ').trim();
  
  // Check if poster exists and construct proper URL
  const hasApiPoster = backgroundImage && typeof backgroundImage === 'string';
  
  // Construct full URL for API posters
  let fullPosterUrl = '';
  if (hasApiPoster) {
    if (backgroundImage.startsWith('http')) {
      // Already a full URL
      fullPosterUrl = backgroundImage;
    } else if (backgroundImage.startsWith('/')) {
      // Relative path, add base URL
      fullPosterUrl = `https://streamed.pk${backgroundImage}`;
    } else {
      // Use sport fallback
      fullPosterUrl = getSportPosterUrl(match.sportId, match.category);
    }
  } else {
    // No API poster, use sport fallback
    fullPosterUrl = getSportPosterUrl(match.sportId, match.category);
  }
  
  const finalPosterUrl = fullPosterUrl;
  
  const [posterLoaded, setPosterLoaded] = React.useState(false);
  const [posterError, setPosterError] = React.useState(false);
  
  // Create the content element that will be used inside either Link or div
  const cardContent = (
    <Card className="relative overflow-hidden h-full transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg bg-card text-card-foreground rounded-xl">
      <AspectRatio 
        ratio={16/10} 
        className="w-full"
      >
        <div className="absolute inset-0 p-2 md:p-4 flex flex-col h-full">
          {/* Background Image - Always show poster (API or sport fallback) */}
          <img
            src={finalPosterUrl}
            alt={`${cleanTitle} poster`}
            className="absolute inset-0 w-full h-full object-cover"
            loading={isPriority ? 'eager' : 'lazy'}
            onLoad={() => {
              setPosterLoaded(true);
              console.log('Poster loaded successfully:', finalPosterUrl);
            }}
            onError={(e) => {
              setPosterError(true);
              console.error('Poster failed to load:', finalPosterUrl, e);
              // If sport poster fails, try a generic poster
              const fallbackUrl = 'https://streamed.pk/api/images/sport/football.webp';
              if (e.currentTarget.src !== fallbackUrl) {
                e.currentTarget.src = fallbackUrl;
              }
            }}
          />
          {/* Enhanced overlay - darker gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/20" />

          {/* Live Badge - Top Left */}
          <div className="relative z-10 flex justify-start items-start mb-2">
            {isLive && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px] md:text-xs px-1.5 py-0.5 font-medium animate-pulse backdrop-blur-sm">
                • LIVE
              </Badge>
            )}
          </div>

          {/* Spacer to push content to bottom */}
          <div className="flex-1"></div>

          {/* Bottom Content with enhanced text backgrounds */}
          <div className="relative z-10 space-y-2">
            {/* Match Title with smaller text */}
            <div className="space-y-1">
              <h3 className="text-foreground font-semibold text-xs md:text-sm leading-tight">
                <span className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  {cleanTitle}
                </span>
              </h3>
            </div>

            {/* Date, Time and Stream Info with background */}
            <div className="flex justify-between items-center pt-1 border-t border-border/60 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
              <div className="flex items-center gap-1 text-muted-foreground text-[9px] md:text-[10px]">
                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span>{formatDate(match.date)} • {formatTime(match.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Play className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="text-[9px] md:text-[10px] font-medium">
                    {hasStream ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}` : 'No streams'}
                  </span>
                </div>
                {hasStream && (
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
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

export default MatchCard;
