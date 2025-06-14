
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
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    return (
      matchTime - now < oneHourInMs &&
      now - matchTime < threeHoursInMs
    );
  };

  const handleWatchNow = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/manual-match/${match.id}`);
  };

  return (
    <div
      className="relative flex flex-col justify-between bg-[#181c23] border border-[#242836] rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer group"
      onClick={handleWatchNow}
    >
      <AspectRatio ratio={16 / 9} className="relative w-full">
        {match.image && match.image !== "https://imgur.com/undefined" ? (
          <img
            src={match.image}
            alt={`${match.teams.home} vs ${match.teams.away}`}
            className="absolute inset-0 object-cover w-full h-full z-0 opacity-75 blur-[1.5px] scale-110 pointer-events-none"
            onError={e => { e.currentTarget.style.display='none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* Card Content Box */}
        <div className="absolute inset-0 flex flex-col justify-between z-10 p-3">
          
          {/* Top: Match date/time and live badge */}
          <div className="flex items-center justify-between">
            <span className="bg-[#fff]/10 text-xs text-white rounded px-2 py-1 font-semibold backdrop-blur-xs shadow">
              {formatMatchDate(match.date)} • {formatMatchTime(match.date)}
            </span>
            {isMatchLive() && (
              <span className="flex items-center gap-1 bg-[#ff5a36] text-white text-[11px] px-2 py-1 font-bold rounded shadow animate-fade-in">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          
          {/* Center: Teams info */}
          <div className="flex flex-col items-center justify-center mt-4 mb-3 grow">
            <div className="flex w-full items-center justify-center gap-4">
              <span className="font-bold text-lg md:text-xl text-white text-center max-w-[48%] truncate shadow-black drop-shadow">
                {match.teams.home}
              </span>
              <span className="font-extrabold text-[#ff5a36] text-lg md:text-xl tracking-wider px-2">VS</span>
              <span className="font-bold text-lg md:text-xl text-white text-center max-w-[48%] truncate shadow-black drop-shadow">
                {match.teams.away}
              </span>
            </div>
            <div className="mt-2 font-medium text-white text-sm text-center px-2 truncate max-w-[90%] opacity-90">
              {match.title.length > 36 ? `${match.title.slice(0, 34)}...` : match.title}
            </div>
          </div>

          {/* Watch Now Button */}
          <div className="flex justify-center">
            <Button
              className="bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold py-2 px-5 text-base rounded-md shadow flex items-center gap-2 transition duration-150"
              size="default"
              onClick={handleWatchNow}
            >
              <Play size={18} />
              Watch Now
            </Button>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default ManualMatchCard;

