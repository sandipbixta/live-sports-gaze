
import React from "react";
import { ManualMatch } from "@/types/manualMatch";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Format the date and time for Australia (AEST/AEDT)
  const matchDate = new Date(match.date);
  const timeString = matchDate.toLocaleTimeString('en-AU', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'Australia/Sydney'
  });
  const dateString = matchDate.toLocaleDateString('en-AU', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Australia/Sydney'
  });

  return (
    <div 
      className="relative w-full max-w-xs sm:max-w-sm h-52 sm:h-64 rounded-lg bg-black overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 group shadow-lg"
      style={{ minWidth: 0 }}
      onClick={() => navigate(`/manual-match/${match.id}`)}
    >
      {/* Background Image */}
      {match.image && match.image !== "https://imgur.com/undefined" ? (
        <img
          src={match.image}
          alt={match.title || `${match.teams.home} vs ${match.teams.away}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <span className="text-white text-lg font-bold">
            {match.teams.home} vs {match.teams.away}
          </span>
        </div>
      )}

      {/* ===== SHADOW OVERLAYS ===== */}
      {/* Top shadow */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20" />
      {/* Bottom shadow */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-20" />

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

      {/* Top Section - Time and LIVE badge */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex justify-between items-start z-30">
        {/* Time + Timezone label (AEST/AEDT) in a row */}
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 flex flex-col items-start">
          <div className="text-white text-xs sm:text-sm font-bold">{timeString} <span className="text-xs text-gray-400 ml-1">AEST</span></div>
        </div>
        {/* LIVE Badge */}
        <Badge variant="live" className="text-xs font-bold">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>
          LIVE
        </Badge>
      </div>

      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <div className="bg-[#ff5a36] rounded-full p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
        </div>
      </div>

      {/* Title and Date at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-30">
        <h3 className="text-white text-base sm:text-lg font-bold leading-tight mb-1 line-clamp-1">
          {match.teams.home} vs {match.teams.away}
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm">
          {dateString}
        </p>
      </div>
    </div>
  );
};

export default ManualMatchCard;
