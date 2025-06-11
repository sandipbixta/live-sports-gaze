
import React from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
import { ManualMatch } from '@/data/manualMatches';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ManualMatchCardProps {
  match: ManualMatch;
  onWatchNow: () => void;
}

const ManualMatchCard = ({ match, onWatchNow }: ManualMatchCardProps) => {
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isMatchLive = () => {
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    
    return (
      matchTime - now < oneHourInMs && // Match starts within 1 hour
      now - matchTime < sixHoursInMs  // Match can be live up to 6 hours after start
    );
  };

  return (
    <Card className="bg-[#242836] border-[#343a4d] hover:bg-[#2a2f3f] transition-all duration-200 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-white text-sm line-clamp-2">{match.title}</h3>
          {isMatchLive() && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between text-white text-sm">
            <span className="font-medium">{match.teams.home}</span>
            <span className="text-gray-400 font-bold">VS</span>
            <span className="font-medium">{match.teams.away}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Calendar size={12} />
            <span>{formatMatchDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{formatMatchTime(match.date)}</span>
          </div>
        </div>
        
        <Button 
          onClick={onWatchNow}
          className="w-full bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-medium py-2 flex items-center justify-center gap-2"
        >
          <Play size={16} />
          Watch Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManualMatchCard;
