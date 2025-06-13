
import React from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
import { ManualMatch } from '@/data/manualMatches';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useNavigate } from 'react-router-dom';

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

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
    const threeHoursInMs = 3 * 60 * 60 * 1000; // Changed to 3 hours
    
    return (
      matchTime - now < oneHourInMs && // Match starts within 1 hour
      now - matchTime < threeHoursInMs  // Match can be live up to 3 hours after start
    );
  };

  const handleWatchNow = () => {
    navigate(`/manual-match/${match.id}`);
  };

  return (
    <div className="relative rounded-md overflow-hidden h-full transition-all duration-300 group cursor-pointer" onClick={handleWatchNow}>
      <AspectRatio ratio={16/10} className="bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Background Image if available */}
        {match.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${match.image})` }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10"></div>
        
        {/* Match Time */}
        <div className="absolute top-1 left-1 z-20">
          <div className="bg-black/70 text-white px-1 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatMatchTime(match.date)}
          </div>
        </div>
        
        {/* Live Badge */}
        <div className="absolute top-1 right-1 z-30">
          {isMatchLive() && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>
        
        {/* Teams Display */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-2">
          <div className="flex items-center justify-between text-white text-sm mb-2">
            <span className="font-medium text-center">{match.teams.home}</span>
            <span className="text-gray-400 font-bold mx-2">VS</span>
            <span className="font-medium text-center">{match.teams.away}</span>
          </div>
          
          <h3 className="font-semibold text-center text-white text-[10px] md:text-xs truncate px-1">
            {match.title.length > 20 ? `${match.title.substring(0, 20)}...` : match.title}
          </h3>
          
          <p className="text-center text-[#1EAEDB] text-[8px] md:text-[10px] mt-1">
            {formatMatchDate(match.date)}
          </p>
          
          {/* Watch Now Button - appears on hover */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              className="w-full bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-medium py-1 text-xs flex items-center justify-center gap-1"
              size="sm"
            >
              <Play size={12} />
              Watch Now
            </Button>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default ManualMatchCard;
