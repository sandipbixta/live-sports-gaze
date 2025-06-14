
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
      className="relative flex flex-col bg-[#181c23] border border-[#252525] rounded-xl shadow-lg overflow-hidden hover:scale-[1.025] transition-transform duration-200 cursor-pointer group"
      onClick={handleWatchNow}
    >
      <AspectRatio ratio={16 / 9} className="relative w-full flex flex-col justify-end">
        {/* Card Image or fallback (no blur, no overlay) */}
        {match.image && match.image !== "https://imgur.com/undefined" ? (
          <img
            src={match.image}
            alt={`${match.teams.home} vs ${match.teams.away}`}
            className="absolute inset-0 object-cover w-full h-full z-0"
            onError={e => { e.currentTarget.style.display='none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* Top Info Bar */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
          <span className="bg-black/70 text-xs text-white rounded px-2 py-1 font-semibold">
            {formatMatchDate(match.date)} • {formatMatchTime(match.date)}
          </span>
          {isMatchLive() && (
            <span className="flex items-center gap-1 bg-[#ff5a36] text-white text-[11px] px-2 py-1 font-bold rounded shadow animate-fade-in">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Center: Team Logos and Names */}
        <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
          <div className="flex justify-center items-center gap-6 w-full mt-6">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
              {match.teams?.home_logo ? (
                <img
                  src={match.teams.home_logo}
                  alt={match.teams.home}
                  className="w-14 h-14 object-contain rounded-full bg-white p-1 shadow-md border border-gray-200"
                  draggable={false}
                />
              ) : (
                <span className="font-bold text-lg md:text-xl text-white drop-shadow text-center">
                  {match.teams.home}
                </span>
              )}
            </div>
            <span className="font-extrabold text-[#ff5a36] text-base md:text-lg tracking-wider px-2">VS</span>
            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              {match.teams?.away_logo ? (
                <img
                  src={match.teams.away_logo}
                  alt={match.teams.away}
                  className="w-14 h-14 object-contain rounded-full bg-white p-1 shadow-md border border-gray-200"
                  draggable={false}
                />
              ) : (
                <span className="font-bold text-lg md:text-xl text-white drop-shadow text-center">
                  {match.teams.away}
                </span>
              )}
            </div>
          </div>
          {/* Title */}
          <div className="mt-3 text-center max-w-[90%] mx-auto">
            <span className="text-base md:text-lg font-medium text-white/90 shadow-black drop-shadow">
              {match.title.length > 40 ? `${match.title.slice(0, 38)}...` : match.title}
            </span>
          </div>
        </div>

        {/* Watch Now Button */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <Button
            className="bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold py-2 px-6 rounded-lg shadow-lg text-base flex items-center gap-2 animate-fade-in"
            size="default"
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
