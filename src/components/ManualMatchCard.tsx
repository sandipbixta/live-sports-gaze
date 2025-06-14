
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

  // Format time and date helpers
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
      className="relative flex flex-row items-stretch bg-[#181c23] border border-[#252525] rounded-xl shadow-lg overflow-hidden hover:scale-[1.015] transition-transform duration-200 cursor-pointer group min-h-[160px]"
      onClick={handleWatchNow}
    >
      {/* Left Column: Logos & details */}
      <div className="flex flex-col justify-between p-4 min-w-[210px] max-w-[260px] w-full z-10">
        {/* Top Info: Date & Time */}
        <div className="flex items-center space-x-2 mb-2">
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
        {/* Teams */}
        <div className="flex gap-2 items-center mb-2">
          {/* Home logo/name */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
              {/* No blur: show only placeholder with letter if image missing  */}
              <span className="font-bold text-black text-lg">
                {match.teams.home.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-white font-medium mt-1">{match.teams.home}</span>
          </div>
          <span className="mx-2 text-[#ff5a36] font-extrabold">VS</span>
          {/* Away logo/name */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
              {/* No blur: show only placeholder with letter if image missing  */}
              <span className="font-bold text-black text-lg">
                {match.teams.away.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-white font-medium mt-1">{match.teams.away}</span>
          </div>
        </div>
        {/* Match Title */}
        <div className="truncate text-sm text-white/90 font-semibold mb-3">
          {match.title}
        </div>
        {/* Watch (only play icon) */}
        <Button
          className="bg-[#ff5a36] hover:bg-[#e64d2e] w-9 h-9 p-0 rounded-full flex items-center justify-center shadow-lg group/button"
          size="icon"
          onClick={e => { e.stopPropagation(); handleWatchNow(e); }}
          aria-label="Watch Match"
        >
          <Play size={18} />
        </Button>
      </div>
      {/* Right: Match image as side background (covers right 2/3 of card) */}
      <div className="relative flex-1 overflow-hidden hidden sm:block">
        <AspectRatio ratio={16/9} className="w-full h-full">
          {match.image && match.image !== "https://imgur.com/undefined" ? (
            <img
              src={match.image}
              alt={`${match.teams.home} vs ${match.teams.away}`}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}
          {/* optional: dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30" />
        </AspectRatio>
      </div>
    </div>
  );
};

export default ManualMatchCard;
