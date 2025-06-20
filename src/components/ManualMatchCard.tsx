
import React from "react";
import { ManualMatch } from "@/types/manualMatch";
import { useNavigate } from "react-router-dom";
import { Play, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Format the date and time for Australia (AEST/AEDT)
  const matchDate = new Date(match.date);

  // Show as "12:00" 24hr format
  const timeString = matchDate.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Sydney"
  });

  // Get day abbreviation (SAT, SUN, etc.)
  const dayString = matchDate.toLocaleDateString("en-AU", {
    weekday: "short",
    timeZone: "Australia/Sydney"
  }).toUpperCase();

  return (
    <div
      className="
        relative w-full 
        h-32 sm:h-36 md:h-40
        rounded-lg overflow-hidden 
        cursor-pointer hover:scale-105 transition-transform duration-200 group shadow-lg
        bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-amber-600/20
        border border-amber-500/30
        "
      style={{ minWidth: 0 }}
      onClick={() => navigate(`/manual-match/${match.id}`)}
    >
      {/* Background Image with Overlay */}
      {match.image && match.image !== "https://imgur.com/undefined" ? (
        <>
          <img
            src={match.image}
            alt={match.title || `${match.teams.home} vs ${match.teams.away}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Golden Lines Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" 
           style={{
             backgroundImage: `repeating-linear-gradient(
               90deg,
               transparent,
               transparent 2px,
               rgba(245, 158, 11, 0.1) 2px,
               rgba(245, 158, 11, 0.1) 4px
             )`
           }} />

      {/* Top Section - Time and Lock */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-30">
        {/* Time Badge */}
        <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
          <Lock className="w-3 h-3 text-amber-400" />
          <span className="text-white text-xs font-bold">
            {dayString} {timeString}
          </span>
        </div>
        
        {/* LIVE Badge */}
        <Badge
          variant="live"
          className="
            text-xs font-bold 
            px-2 py-1 bg-[#ff5a36] shadow 
            rounded-full flex items-center gap-1
            "
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </Badge>
      </div>

      {/* Center Content - Team Logos and VS */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Home Team Logo Placeholder */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full border-2 border-amber-400/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs sm:text-sm font-bold text-center leading-tight">
              {match.teams.home.substring(0, 3).toUpperCase()}
            </span>
          </div>
          
          {/* VS Text */}
          <div className="text-amber-400 font-bold text-sm sm:text-lg">VS</div>
          
          {/* Away Team Logo Placeholder */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full border-2 border-amber-400/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-xs sm:text-sm font-bold text-center leading-tight">
              {match.teams.away.substring(0, 3).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Center Play Button - appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-[#ff5a36] rounded-full p-3 shadow-lg">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Premium Experience Badge */}
      <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-20">
        <div className="bg-gradient-to-r from-amber-600 to-yellow-500 py-1">
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white rotate-45" />
              ))}
            </div>
            <span className="text-black text-xs font-bold tracking-wider">
              PREMIUM EXPERIENCE
            </span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white rotate-45" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Match Details */}
      <div className="absolute bottom-2 left-2 right-2 z-30">
        <div className="text-center">
          <h3 className="text-white text-sm sm:text-base font-bold mb-1">
            {match.teams.home} vs. {match.teams.away}
          </h3>
          <p className="text-amber-400 text-xs font-semibold">
            FIFA Club World Cup™
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
