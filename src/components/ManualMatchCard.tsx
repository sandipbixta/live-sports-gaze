
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

  // Formatting helpers
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
      className="relative flex min-h-[140px] sm:min-h-[160px] bg-[#181c23] border border-[#252525] rounded-xl shadow-lg overflow-hidden hover:scale-[1.015] transition-transform duration-200 cursor-pointer group"
      onClick={handleWatchNow}
    >
      {/* Left side: all info + small play button */}
      <div className="relative flex flex-col justify-between px-4 py-3 min-w-[190px] max-w-[240px] w-full z-10">
        <div className="flex flex-col gap-2">
          {/* Date & Time row */}
          <div className="flex items-center gap-2">
            <span className="bg-black/70 text-xs text-white rounded px-2 py-0.5 font-semibold">
              {formatMatchDate(match.date)} • {formatMatchTime(match.date)}
            </span>
            {isMatchLive() && (
              <span className="flex items-center gap-1 bg-[#ff5a36] text-white text-[11px] px-2 py-0.5 font-bold rounded shadow animate-fade-in">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
              </span>
            )}
          </div>
          {/* Match Title */}
          <div className="truncate text-xs text-white/90 font-semibold">{match.title}</div>
          {/* Teams home vs away */}
          <div className="flex items-center gap-3 mt-1 mb-1">
            {/* Home */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center overflow-hidden">
                <span className="font-bold text-black text-base">
                  {match.teams.home.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-white/90 font-medium leading-tight text-center max-w-[60px] truncate">{match.teams.home}</span>
            </div>
            <span className="text-[#ff5a36] font-extrabold text-sm">VS</span>
            {/* Away */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center overflow-hidden">
                <span className="font-bold text-black text-base">
                  {match.teams.away.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-white/90 font-medium leading-tight text-center max-w-[60px] truncate">{match.teams.away}</span>
            </div>
          </div>
        </div>
        {/* Play icon, smaller and round, bottom-left */}
        <Button
          className="mt-2 w-7 h-7 p-0 rounded-full flex items-center justify-center shadow-lg bg-[#ff5a36] hover:bg-[#e64d2e] group/button"
          size="icon"
          onClick={e => { e.stopPropagation(); handleWatchNow(e); }}
          aria-label="Watch Match"
        >
          <Play size={14} />
        </Button>
      </div>
      {/* Right: Match image as background (super dimmed) */}
      <div className="relative flex-1 overflow-hidden hidden sm:block">
        <AspectRatio ratio={16/9} className="w-full h-full">
          {match.image && match.image !== "https://imgur.com/undefined" ? (
            <>
              <img
                src={match.image}
                alt={`${match.teams.home} vs ${match.teams.away}`}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                draggable={false}
              />
              {/* Extra dark overlay for better text contrast */}
              <div className="absolute inset-0 bg-black/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}
        </AspectRatio>
      </div>
    </div>
  );
};

export default ManualMatchCard;
