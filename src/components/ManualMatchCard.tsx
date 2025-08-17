
import React from "react";
import { ManualMatch } from "@/types/manualMatch";
import { useNavigate } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Format the date and time for Australia (AEST/AEDT)
  const matchDate = new Date(match.date);

  // Show as "12:00" 24hr on mobile, bigger on desktop.
  const timeString = matchDate.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Sydney"
  });
  // Show as "16 June" on mobile, "Jun 16" on desktop.
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

  // Enhanced poster logic similar to MatchCard
  const getPosterUrl = () => {
    if (!match.image) return null;
    
    // If it's already a full URL, use it directly
    if (match.image.startsWith('http')) {
      return match.image;
    }
    
    // If it's a relative path, try different base URLs
    const basePaths = [
      'https://streamed.pk',
      'https://streamed.su'
    ];
    
    for (const basePath of basePaths) {
      const fullUrl = `${basePath}${match.image}`;
      return fullUrl;
    }
    
    return match.image;
  };

  const posterUrl = getPosterUrl();
  const hasValidImage = posterUrl && 
    posterUrl !== "https://imgur.com/undefined" && 
    posterUrl.trim() !== "";

  return (
    <div
      className="
        relative w-full 
        cursor-pointer hover:scale-105 transition-transform duration-200 group shadow-lg
        flex flex-col
        "
      style={{ minWidth: 0 }}
      onClick={() => navigate(`/manual-match/${match.id}`)}
    >
      {/* Card Image Container */}
      <div className="
        relative w-full 
        h-[120px] xs:h-[130px] sm:h-[140px] 
        md:h-64
        rounded-lg bg-black overflow-hidden 
        flex flex-col
      ">
        {/* Background Image or Fallback */}
        {hasValidImage ? (
          <img
            src={posterUrl}
            alt={match.title || `${match.teams.home} vs ${match.teams.away}`}
            className="w-full h-full object-cover"
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
        ) : null}
        
        {/* Fallback background for when no image or image fails */}
        <div 
          className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${hasValidImage ? 'hidden' : ''}`}
          style={{ display: hasValidImage ? 'none' : 'flex' }}
        >
          <span className="text-white text-sm sm:text-lg font-bold text-center px-2">
            {match.teams.home} vs {match.teams.away}
          </span>
        </div>

        {/* Top shadow overlays */}
        <div className="pointer-events-none absolute top-0 left-0 w-full h-8 sm:h-10 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top Section - Time, Date and LIVE badge */}
        <div
          className="
            absolute top-1 left-0 right-0 px-1 xs:px-2 sm:px-3
            flex justify-between items-start z-30
          "
        >
          {/* Time + Date + Timezone label */}
          <div
            className="bg-black/70 backdrop-blur-sm rounded px-1.5 xs:px-2 py-[2px] flex flex-col items-start"
          >
            <div
              className="
                text-white 
                text-[11px] xs:text-[13px] sm:text-sm font-bold leading-tight 
                flex items-baseline gap-1
              "
            >
              <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
              {timeString}
              <span className="text-[10px] xs:text-[11px] sm:text-xs text-gray-300 ml-0.5 font-semibold tracking-wide">AEST</span>
            </div>
            <div className="text-[10px] xs:text-[11px] sm:text-xs text-gray-300 font-medium mt-[1px]">
              {/* Mobile: "16 June", desktop: "Jun 16" */}
              <span className="sm:hidden">{dateStringMobile}</span>
              <span className="hidden sm:inline">{dateStringDesktop}</span>
            </div>
          </div>
          {/* LIVE Badge */}
          <Badge
            variant="live"
            className="
              text-[11px] xs:text-[12px] sm:text-xs font-bold 
              px-1.5 xs:px-2 py-[1px] xs:py-[2px] bg-[#ff5a36] shadow 
              rounded-full flex items-center
              "
            style={{ minHeight: 0, height: 'auto' }}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1" />
            LIVE
          </Badge>
        </div>

        {/* Center Play Button - much smaller on mobile */}
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="
              bg-[#ff5a36] rounded-full 
              p-2 xs:p-2.5 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg
            ">
            <Play className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Team Names and Additional Date Below the Card */}
      <div className="mt-2 px-1 xs:px-2">
        <div className="
          flex flex-col items-start justify-center
          text-white
          text-[13px] xs:text-[14px] sm:text-base md:text-lg 
          font-bold leading-tight mb-1
        ">
          {/* Show title instead of team names with vs */}
          <span className="truncate max-w-full text-left text-[12px] xs:text-[13px] sm:text-base">
            {match.title}
          </span>
        </div>
        {/* Enhanced date and time display below the card */}
        <div className="flex items-center gap-2 text-gray-400 text-[11px] xs:text-xs sm:text-sm text-left">
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

export default ManualMatchCard;
