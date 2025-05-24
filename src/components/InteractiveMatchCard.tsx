
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Match } from '../types/sports';
import TrendingBadge from './TrendingBadge';
import WatchPartyIndicator from './WatchPartyIndicator';
import { isTrendingMatch } from '../utils/popularLeagues';

interface InteractiveMatchCardProps {
  match: Match;
  sportId: string;
  isPriority?: boolean;
  className?: string;
}

const InteractiveMatchCard: React.FC<InteractiveMatchCardProps> = ({ 
  match, 
  sportId, 
  isPriority = false,
  className = ""
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 50);
  const [isHovered, setIsHovered] = useState(false);
  
  const trendingInfo = isTrendingMatch(match.title);
  const isHot = trendingInfo.score > 7;
  const viewers = Math.floor(Math.random() * 10000) + 1000;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: match.title,
        text: `Watch ${match.title} live on DAMITV`,
        url: window.location.origin + `/match/${sportId}/${match.id}`,
      });
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-[#343a4d] bg-gradient-to-br from-[#1A1F2C] to-[#242836] ${
        isPriority ? 'border-[#ff5a36] shadow-lg' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/match/${sportId}/${match.id}`} className="block">
        <CardContent className="p-3 sm:p-4">
          {/* Header with trending badge */}
          <div className="flex justify-between items-start mb-2">
            <TrendingBadge isHot={isHot} />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="h-3 w-3" />
              <span>{viewers.toLocaleString()}</span>
            </div>
          </div>

          {/* Match title */}
          <h3 className="font-semibold text-sm sm:text-base text-white mb-2 line-clamp-2 group-hover:text-[#ff5a36] transition-colors">
            {match.title}
          </h3>

          {/* Match details */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Live Now</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`${isHot ? 'bg-red-600 text-white animate-pulse' : 'bg-[#343a4d] text-gray-300'} text-xs`}
            >
              {isHot ? 'HOT' : 'LIVE'}
            </Badge>
          </div>

          {/* Interactive buttons */}
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'
          }`}>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-8 px-2 text-xs transition-colors ${
                  isLiked ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 px-2 text-xs text-gray-400 hover:text-white"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-[#ff5a36] border-[#ff5a36] text-white hover:bg-[#e64d2e] hover:border-[#e64d2e] transition-all duration-300"
            >
              Watch Now
            </Button>
          </div>

          {/* Watch Party for popular matches */}
          {isHot && <WatchPartyIndicator matchTitle={match.title} isPopular={true} />}
        </CardContent>
      </Link>
      
      {/* Animated border effect for hot matches */}
      {isHot && (
        <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-lg opacity-75 animate-pulse pointer-events-none"></div>
      )}
    </Card>
  );
};

export default InteractiveMatchCard;
