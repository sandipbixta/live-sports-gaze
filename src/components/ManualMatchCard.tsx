import React from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
import { ManualMatch } from '@/types/manualMatch';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useNavigate } from 'react-router-dom';

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Always format using UTC, so time is fixed regardless of user's local browser timezone.
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC' // force UTC display
    });
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
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
        {match.image && match.image !== "https://imgur.com/undefined" && (
          <img
            src={match.image}
            alt={`${match.teams.home} vs ${match.teams.away}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', match.image);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        
        {/* Stronger overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 z-10"></div>
        
        {/* Match Time */}
        <div className="absolute top-2 left-2 z-20">
          <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/20">
            <Clock className="w-3 h-3" />
            {formatMatchTime(match.date)}
          </div>
        </div>
        
        {/* Live Badge */}
        <div className="absolute top-2 right-2 z-30">
          {isMatchLive() && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-white/20">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>
        
        {/* Teams Display with enhanced visibility */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3">
          <div className="flex items-center justify-between text-white text-sm mb-3">
            <span className="font-bold text-center text-white drop-shadow-lg">{match.teams.home}</span>
            <span className="text-white font-bold mx-3 drop-shadow-lg">VS</span>
            <span className="font-bold text-center text-white drop-shadow-lg">{match.teams.away}</span>
          </div>
          
          <h3 className="font-bold text-center text-white text-sm md:text-base truncate px-2 drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-lg py-1">
            {match.title.length > 20 ? `${match.title.substring(0, 20)}...` : match.title}
          </h3>
          
          <p className="text-center text-cyan-300 text-xs md:text-sm mt-2 font-semibold drop-shadow-lg">
            {formatMatchDate(match.date)}
          </p>
          
          {/* Watch Now Button - appears on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              className="w-full bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold py-2 text-sm flex items-center justify-center gap-2 shadow-lg border border-white/20"
              size="sm"
            >
              <Play size={14} />
              Watch Now
            </Button>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default ManualMatchCard;
