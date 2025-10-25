import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Trophy, Clock, Info, Circle } from 'lucide-react';
import { Match } from '@/types/sports';
import { formatViewerCount } from '@/services/viewerCountService';
import damitvCover from '@/assets/damitv-cover.jpeg';

interface NetflixMatchCardProps {
  match: Match;
  sportId: string;
}

const getSportIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    football: <Circle className="w-4 h-4 fill-white" />,
    basketball: <Circle className="w-4 h-4 fill-orange-500" />,
    default: <Trophy className="w-4 h-4" />
  };
  return icons[category.toLowerCase()] || icons.default;
};

const NetflixMatchCard: React.FC<NetflixMatchCardProps> = ({ match, sportId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState<string>('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const matchTime = match.date;
      const diffMs = matchTime - now;
      
      if (diffMs < -3 * 60 * 60 * 1000) {
        setIsLive(false);
        setTimeDisplay('Ended');
      } else if (diffMs <= 2 * 60 * 60 * 1000) {
        setIsLive(true);
        setTimeDisplay('LIVE NOW');
      } else {
        setIsLive(false);
        const date = new Date(matchTime);
        setTimeDisplay(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [match.date]);

  const thumbnail = match.poster || damitvCover;
  const hasStream = match.sources && match.sources.length > 0;
  const viewerCount = match.viewerCount || 0;

  const cardContent = (
    <div 
      className="group relative w-full cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AspectRatio ratio={16 / 9} className="bg-[#1a1f2e] overflow-hidden rounded-lg">
        {/* Thumbnail Image */}
        <img
          src={thumbnail}
          alt={match.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* League/Competition badge - top-left */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-black/70 backdrop-blur-sm border-none">
            {match.category.toUpperCase()}
          </Badge>
        </div>

        {/* Sport icon - top-right */}
        <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-sm rounded-full p-1.5">
          {getSportIcon(match.category)}
        </div>

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <Badge variant="live" className="text-xs px-3 py-1 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </Badge>
          </div>
        )}

        {/* Main content - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          {/* Teams */}
          <div className="mb-2">
            <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 mb-1">
              {match.title}
            </h3>
            {match.teams?.home && match.teams?.away && (
              <div className="flex items-center gap-2 text-xs text-white/90">
                <span className="font-semibold">{match.teams.home.name}</span>
                <span className="text-white/60">vs</span>
                <span className="font-semibold">{match.teams.away.name}</span>
              </div>
            )}
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-xs text-white/80 mb-2">
            <Clock className="w-3 h-3" />
            <span>{timeDisplay}</span>
          </div>

          {/* Disclaimer badge */}
          <div className="flex items-center gap-1 text-[9px] text-white/50">
            <Info className="w-3 h-3" />
            <span>Stream sourced from third party · damitv does not host content</span>
          </div>
        </div>

        {/* Hover content - center */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 z-20 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {hasStream && (
            <>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3 transition-transform duration-300 hover:scale-110">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">Click to watch live</p>
              {viewerCount > 0 && (
                <div className="flex items-center gap-1.5 text-white/90 text-xs">
                  <Users className="w-4 h-4" />
                  <span>{formatViewerCount(viewerCount)} watching</span>
                </div>
              )}
            </>
          )}
        </div>
      </AspectRatio>

      {/* Card shadow on hover */}
      <div className={`absolute inset-0 rounded-lg transition-shadow duration-300 pointer-events-none ${isHovered ? 'shadow-2xl shadow-black/50' : ''}`} />
    </div>
  );

  if (!hasStream) {
    return cardContent;
  }

  return (
    <Link to={`/match/${sportId}/${match.id}`} className="block">
      {cardContent}
    </Link>
  );
};

export default NetflixMatchCard;
