
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

  // Format the date and time
  const matchDate = new Date(match.date);
  const timeString = matchDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  const dateString = matchDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div 
      className="relative w-full max-w-sm mx-auto h-64 bg-black rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 group"
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

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

      {/* Top Section - Time/Date and LIVE badge */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
        {/* Time and Date */}
        <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
          <div className="text-white text-sm font-bold">{timeString}</div>
          <div className="text-gray-300 text-xs">{dateString}</div>
        </div>
        
        {/* LIVE Badge */}
        <Badge variant="live" className="text-xs font-bold">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>
          LIVE
        </Badge>
      </div>

      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[#ff5a36] rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
      </div>

      {/* Title at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-lg font-bold leading-tight">
          {match.title || `${match.teams.home} vs ${match.teams.away}`}
        </h3>
      </div>
    </div>
  );
};

export default ManualMatchCard;
