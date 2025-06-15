
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
      className="flex flex-col md:flex-row w-full max-w-4xl mx-auto border border-[#ff5a36] rounded-none overflow-hidden shadow-lg bg-[#0a0a0a] relative"
      style={{
        minHeight: 340,
        background:
          "radial-gradient(ellipse 120% 80% at 90% 50%, #232323 75%, #181818 100%)",
      }}
    >
      {/* LEFT COLUMN -- Info & Action */}
      <div className="flex flex-col items-start justify-between md:w-[38%] p-8 gap-6 bg-[#000] md:border-r border-[#ff5a36] relative">
        {/* "TIME" label & "LIVE" label */}
        <div className="flex w-full items-center justify-between">
          <span className="text-white text-2xl md:text-lg font-bold tracking-wide uppercase">
            TIME
          </span>
          <span className="absolute right-2 top-2 md:static text-[#ff2020] font-bold text-lg uppercase md:text-base z-10 animate-pulse-subtle">
            LIVE
          </span>
        </div>

        {/* Teams + VS + title */}
        <div className="flex flex-col gap-1 items-start mt-2 mb-2">
          <span className="text-white text-xl md:text-2xl font-extrabold uppercase leading-tight">
            {match.teams.home} <span className="font-black text-[#ff5a36]">VS</span> {match.teams.away}
          </span>
          {match.title && (
            <span className="text-zinc-300 text-base font-medium truncate mt-1">
              {match.title}
            </span>
          )}
        </div>

        {/* Date */}
        <div>
          <span className="uppercase text-xs font-semibold text-zinc-400 block tracking-wider mb-px">
            Date
          </span>
          <span className="text-white text-lg font-semibold">
            {formatDate(match.date)} &bull; {formatTime(match.date)}
          </span>
        </div>

        {/* Action button */}
        <button
          onClick={() => navigate(`/manual-match/${match.id}`)}
          className="mt-8 w-full py-3 bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-extrabold text-xl rounded-none uppercase tracking-widest shadow transition-all duration-200"
          style={{ letterSpacing: 2.5 }}
        >
          WATCH HERE
        </button>
      </div>

      {/* RIGHT COLUMN -- Badges & Branding */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4 py-6 md:py-0 bg-[#0a0a0a]">
        {/* DAMITV label */}
        <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-transparent text-gray-200 font-bold text-sm tracking-wide z-20">
          DAMITV
        </span>
        {/* Badges/Logos center */}
        <div className="flex items-center justify-center gap-6 md:gap-16 min-h-[110px]">
          {/* Home badge */}
          <div className="flex flex-col items-center justify-center">
            {match.image && match.image !== "https://imgur.com/undefined" ? (
              <img
                src={match.image}
                alt={match.teams.home}
                className="w-24 h-24 object-contain drop-shadow-lg bg-transparent"
                draggable={false}
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 bg-[#20242d] rounded-full">
                <span className="text-white/70 text-md font-semibold">
                  {match.teams.home?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {/* Center line */}
          <div className="h-14 w-0.5 bg-gradient-to-b from-[#ff5a36]/80 to-transparent rounded"></div>
          {/* Away badge */}
          <div className="flex flex-col items-center justify-center">
            {/* Try to grab an away logo, fallback to circle+name */}
            {/* You could extend ManualMatch if you want away image! */}
            <div className="flex items-center justify-center w-24 h-24 bg-[#20242d] rounded-full border-4 border-[#ff5a36]">
              <span className="text-white/80 text-md font-bold">
                {match.teams.away?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
