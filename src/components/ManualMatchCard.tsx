
import React from 'react';
import { Play } from 'lucide-react';
import { ManualMatch } from '@/types/manualMatch';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useNavigate } from 'react-router-dom';

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Format time in user's local time zone
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date in user's local time zone
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
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    return (
      matchTime - now < oneHourInMs &&
      now - matchTime < threeHoursInMs
    );
  };

  const handleWatchNow = (e?: React.MouseEvent) => {
    // Prevent accidental navigation while button loading/active
    if (e) e.stopPropagation();
    navigate(`/manual-match/${match.id}`);
  };

  return (
    <div
      className="relative overflow-hidden transition-transform duration-300 cursor-pointer group rounded-xl shadow-2xl hover:scale-105 bg-[#16181D]"
      onClick={handleWatchNow}
    >
      <AspectRatio ratio={16 / 9} className="relative">
        {/* Background Image */}
        {match.image && match.image !== "https://imgur.com/undefined" ? (
          <img
            src={match.image}
            alt={`${match.teams.home} vs ${match.teams.away}`}
            className="absolute inset-0 object-cover w-full h-full z-0 scale-105 group-hover:scale-110 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display='none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* Dark overlay for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/95 via-black/65 to-gray-900/90 z-10" />

        {/* Left Bar: Date/Time */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col items-center justify-center bg-black/40 z-20 backdrop-blur-md border-r border-white/10">
          <div className="text-center text-white font-bold text-xs md:text-sm uppercase tracking-wide">
            {formatMatchDate(match.date)}
          </div>
          <div className="text-center text-[#ff5a36] font-extrabold text-base md:text-lg mt-2 tracking-wide">
            {formatMatchTime(match.date)}
          </div>
        </div>

        {/* LIVE badge */}
        {isMatchLive() && (
          <span className="absolute top-3 right-3 z-30 bg-[#ff5a36] text-white text-xs px-2 py-1 rounded-lg font-semibold flex items-center gap-1 shadow-md">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        )}

        {/* Main content center */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center px-3">
          <div className="flex items-center justify-center gap-3 w-full">
            <span className="font-bold text-white text-lg md:text-2xl truncate max-w-[42%] text-shadow-md text-center drop-shadow-lg">
              {match.teams.home}
            </span>
            <span className="font-bold text-[#ff5a36] text-lg md:text-2xl tracking-wider drop-shadow-lg">VS</span>
            <span className="font-bold text-white text-lg md:text-2xl truncate max-w-[42%] text-shadow-md text-center drop-shadow-lg">
              {match.teams.away}
            </span>
          </div>
          <h3 className="my-2 font-medium text-center text-white text-base md:text-lg px-4 truncate shadow-md bg-black/30 backdrop-blur-lg rounded-md py-1">
            {match.title.length > 30 ? `${match.title.slice(0, 28)}...` : match.title}
          </h3>
          {/* Central Watch Button */}
          <Button
            className="bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold mt-2 py-2 px-6 text-base rounded-lg shadow-lg flex items-center gap-2 opacity-90 hover:opacity-100 transition duration-200"
            size="lg"
            onClick={handleWatchNow}
          >
            <Play size={18} />
            Watch Now
          </Button>
        </div>
      </AspectRatio>
    </div>
  );
};

export default ManualMatchCard;
