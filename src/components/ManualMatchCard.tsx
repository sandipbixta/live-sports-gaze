import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Play, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ManualMatch } from '../types/sports';  // Adjust path to your ManualMatch type

interface ManualMatchCardProps {
  match: ManualMatch;
  onWatchNow: (match: ManualMatch) => void;
}

const ManualMatchCard: React.FC<ManualMatchCardProps> = ({ match, onWatchNow }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch {
      return 'TBD';
    }
  };

  return (
    <Card className="bg-[#242836] border-[#343a4d] hover:border-[#ff5a36] transition-all duration-300 group cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Match title */}
          <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-[#ff5a36] transition-colors">
            {match.title}
          </h3>
          
          {/* Teams */}
          <div className="text-center space-y-1">
            <div className="text-white font-medium text-xs">{match.teams.home}</div>
            <div className="text-gray-400 text-xs">vs</div>
            <div className="text-white font-medium text-xs">{match.teams.away}</div>
          </div>
          
          {/* Date */}
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(match.date)}</span>
          </div>
          
          {/* Watch button */}
          <Button 
            onClick={() => onWatchNow(match)}
            className="w-full bg-[#ff5a36] hover:bg-[#e64d2e] text-white text-xs py-2 h-8"
          >
            <Play className="h-3 w-3 mr-1" />
            Watch Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualMatchCard;
