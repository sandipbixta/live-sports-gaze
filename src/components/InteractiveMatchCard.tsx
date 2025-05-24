
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Match } from '../types/sports';
import TrendingBadge from './TrendingBadge';
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
  const trendingInfo = isTrendingMatch(match.title);
  const isHot = trendingInfo.score > 7;
  const viewers = Math.floor(Math.random() * 5000) + 500;

  return (
    <Card className={`border-[#343a4d] bg-[#242836] hover:bg-[#2a3040] transition-colors ${className}`}>
      <Link to={`/match/${sportId}/${match.id}`} className="block">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <TrendingBadge isHot={isHot} />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users className="h-3 w-3" />
              <span>{viewers.toLocaleString()}</span>
            </div>
          </div>

          <h3 className="font-medium text-sm text-white mb-2 line-clamp-2">
            {match.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Live</span>
            </div>
            <Badge variant="secondary" className="bg-[#343a4d] text-gray-300 text-xs">
              LIVE
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default InteractiveMatchCard;
