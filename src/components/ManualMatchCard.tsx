
import React from "react";
import { ManualMatch } from "@/types/manualMatch";
import { useNavigate } from "react-router-dom";

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Format time and date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-80 bg-black rounded-lg overflow-hidden border border-red-600"
      style={{
        background: `
          radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 50%),
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          ),
          linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)
        `
      }}
    >
      {/* TIME label - top left */}
      <div className="absolute top-6 left-6">
        <span className="text-white text-2xl font-bold tracking-wider">TIME</span>
      </div>

      {/* LIVE label - top right */}
      <div className="absolute top-6 right-6">
        <span className="text-red-500 text-2xl font-bold tracking-wider animate-pulse">LIVE</span>
      </div>

      {/* DAMITV label - top center */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <span className="text-white text-lg font-semibold tracking-wider">DAMITV</span>
      </div>

      {/* Teams vs text - left side */}
      <div className="absolute top-20 left-6">
        <div className="text-white text-3xl font-bold leading-tight">
          <div>{match.teams.home.toUpperCase()} VS</div>
          <div>{match.teams.away.toUpperCase()}</div>
        </div>
      </div>

      {/* DATE label - left side */}
      <div className="absolute bottom-24 left-6">
        <span className="text-white text-lg font-semibold tracking-wider">DATE</span>
        <div className="text-white text-sm mt-1">
          {formatDate(match.date)} • {formatTime(match.date)}
        </div>
      </div>

      {/* WATCH HERE button - bottom left */}
      <div className="absolute bottom-6 left-6">
        <button
          onClick={() => navigate(`/manual-match/${match.id}`)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 text-xl tracking-wider transition-colors duration-200"
        >
          WATCH HERE
        </button>
      </div>

      {/* Team logos - center right */}
      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 flex items-center gap-8">
        {/* Home team logo */}
        <div className="flex flex-col items-center">
          {match.image && match.image !== "https://imgur.com/undefined" ? (
            <img
              src={match.image}
              alt={match.teams.home}
              className="w-24 h-24 object-contain drop-shadow-lg"
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center w-24 h-24 bg-red-600 rounded-full border-4 border-yellow-400">
              <span className="text-white text-2xl font-bold">
                {match.teams.home?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-50"></div>

        {/* Away team logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-24 h-24 bg-purple-800 rounded-full border-4 border-pink-400">
            <span className="text-white text-2xl font-bold">
              {match.teams.away?.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative diagonal lines pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.1) 20px,
              rgba(255,255,255,0.1) 21px
            )`
          }}
        ></div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
