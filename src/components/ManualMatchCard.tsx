
import React from "react";
import { ManualMatch } from "@/types/manualMatch";
import { useNavigate } from "react-router-dom";

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="relative w-full max-w-sm mx-auto h-64 bg-black rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
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
