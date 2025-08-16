import React from "react";
import { ProcessedTopEmbedMatch } from "@/services/topEmbedApiService";
import { Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopEmbedVerticalCardProps {
  match: ProcessedTopEmbedMatch;
  onClick?: () => void;
}

const TopEmbedVerticalCard = ({ match, onClick }: TopEmbedVerticalCardProps) => {
  // Format the date and time for Australia (AEST/AEDT)
  const matchDate = new Date(match.date);

  const timeString = matchDate.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Sydney"
  });

  const dateStringMobile = matchDate.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  });

  const dateStringDesktop = matchDate.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    timeZone: "Australia/Sydney"
  });

  // Check if we have a valid poster URL
  const hasValidPoster = match.poster && match.poster.trim() !== "";

  return (
    <div
      className="
        relative w-full 
        cursor-pointer hover:scale-105 transition-transform duration-200 group shadow-lg
        flex flex-col
      "
      style={{ minWidth: 0 }}
      onClick={onClick}
    >
      {/* Card Image Container */}
      <div className="
        relative w-full 
        h-[200px] xs:h-[220px] sm:h-[240px] 
        md:h-[280px]
        rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden 
        flex flex-col
      ">
        {/* Background Image or Fallback */}
        {hasValidPoster ? (
          <div className="relative w-full h-full">
            <img
              src={match.poster}
              alt={`${match.tournament} logo`}
              className="w-full h-full object-contain p-8"
              draggable={false}
              onError={(e) => {
                // If image fails to load, hide it and show fallback
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            {/* Fallback background for when image fails */}
            <div 
              className="hidden absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"
            >
              <span className="text-white text-sm sm:text-lg font-bold text-center px-2">
                {match.teams.home} vs {match.teams.away}
              </span>
            </div>
          </div>
        ) : (
          /* Fallback background for when no poster */
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-white text-sm sm:text-lg font-bold text-center px-2">
              {match.teams.home} vs {match.teams.away}
            </span>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-12 sm:h-16 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top Section - Tournament and LIVE badge */}
        <div
          className="
            absolute top-2 left-0 right-0 px-2 xs:px-3 sm:px-4
            flex justify-between items-start z-30
          "
        >
          {/* Tournament Badge */}
          <div
            className="bg-black/70 backdrop-blur-sm rounded px-2 xs:px-3 py-1 flex items-center"
          >
            <span className="text-white text-[10px] xs:text-[12px] sm:text-sm font-bold">
              {match.tournament}
            </span>
          </div>
          
          {/* LIVE Badge */}
          <Badge
            variant="live"
            className="
              text-[11px] xs:text-[12px] sm:text-xs font-bold 
              px-2 xs:px-3 py-1 bg-[#ff5a36] shadow 
              rounded-full flex items-center
            "
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1" />
            LIVE
          </Badge>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="
              bg-[#ff5a36] rounded-full 
              p-3 xs:p-4 sm:p-5
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg
            ">
            <Play className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 text-white fill-white" />
          </div>
        </div>

        {/* Bottom Section - Time and Date */}
        <div className="absolute bottom-2 left-2 right-2 z-30">
          <div className="bg-black/70 backdrop-blur-sm rounded px-2 xs:px-3 py-1.5">
            <div className="text-white text-[12px] xs:text-[14px] sm:text-base font-bold flex items-center gap-2">
              <Clock className="w-3 h-3 xs:w-4 xs:h-4" />
              {timeString}
              <span className="text-[10px] xs:text-[12px] sm:text-sm text-gray-300 font-semibold">AEST</span>
            </div>
            <div className="text-[10px] xs:text-[11px] sm:text-sm text-gray-300 font-medium mt-1">
              {/* Mobile: "16 June", desktop: "Jun 16" */}
              <span className="sm:hidden">{dateStringMobile}</span>
              <span className="hidden sm:inline">{dateStringDesktop}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Names Below the Card */}
      <div className="mt-3 px-1 xs:px-2">
        <div className="
          text-white
          text-[13px] xs:text-[15px] sm:text-base md:text-lg 
          font-bold leading-tight mb-2 text-center
        ">
          <span className="block text-[11px] xs:text-[12px] sm:text-sm text-gray-400 font-medium mb-1">
            {match.tournament}
          </span>
          <span className="block truncate max-w-full">
            {match.teams.home}
          </span>
          <span className="block text-[10px] xs:text-[11px] sm:text-xs text-gray-500 font-medium my-1">
            VS
          </span>
          <span className="block truncate max-w-full">
            {match.teams.away}
          </span>
        </div>
        
        {/* Time display below the card */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-[11px] xs:text-xs sm:text-sm">
          <Clock className="w-3 h-3" />
          <span>
            {timeString} • <span className="sm:hidden">{dateStringMobile}</span>
            <span className="hidden sm:inline">{dateStringDesktop}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopEmbedVerticalCard;