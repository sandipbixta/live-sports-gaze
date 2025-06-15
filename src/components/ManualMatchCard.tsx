
import React from 'react';
import { ManualMatch } from '@/types/manualMatch';
import { useNavigate } from 'react-router-dom';

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Helper to format time and date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Team logo helpers (fallback to simple colored circles if missing)
  const homeLogo = match.image && match.image !== 'https://imgur.com/undefined'
    ? match.image
    : null;
  const awayLogo = match.image && match.image !== 'https://imgur.com/undefined'
    ? match.image
    : null;

  return (
    <div
      className="flex flex-col sm:flex-row rounded-2xl bg-black overflow-hidden border border-[#ff5a36] shadow-lg min-h-[250px] w-full max-w-3xl mx-auto"
      style={{ background: 'radial-gradient(ellipse 170% 80% at 80% 50%, #232323 80%, #181818 100%)' }}
    >
      {/* Left Section (Details & Button) */}
      <div className="flex flex-col justify-between p-6 sm:w-[37%] w-full bg-black">
        {/* TIME, Match info */}
        <div>
          <div className="text-white text-lg font-bold tracking-wide mb-2" style={{letterSpacing: "0.04em"}}>
            TIME
          </div>
          <div className="mt-7 mb-2">
            <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3" style={{ letterSpacing: 1 }}>
              {match.teams.home.toUpperCase()}<br />
              VS<br />
              {match.teams.away.toUpperCase()}
            </div>
          </div>
          <div className="uppercase text-xs font-medium text-zinc-300 tracking-wider mt-3">
            DATE
          </div>
          <div className="text-white text-base font-semibold">
            {formatDate(match.date)} &nbsp; {formatTime(match.date)}
          </div>
        </div>
        {/* WATCH HERE Button */}
        <div className="mt-8 mb-2">
          <button
            onClick={() => navigate(`/manual-match/${match.id}`)}
            className="w-full text-lg sm:text-base px-0 py-2 bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold rounded-md transition-colors duration-200 shadow uppercase tracking-wide"
          >
            WATCH HERE
          </button>
        </div>
      </div>
      {/* Right Section (Logos, title, live) */}
      <div className="relative flex-1 flex items-center justify-center bg-black bg-opacity-80">
        {/* DAMITV */}
        <div className="absolute left-5 top-5 text-zinc-200 text-xs font-light tracking-wide hidden sm:block">
          DAMITV
        </div>
        {/* LIVE on top right */}
        <div className="absolute right-6 top-6 text-lg font-bold text-[#ff2020] uppercase tracking-widest z-20">
          LIVE
        </div>
        {/* Centered logos and VS line */}
        <div className="flex flex-row items-center justify-center w-full gap-10 sm:gap-16">
          {/* Home logo */}
          <div className="flex flex-col items-center">
            {homeLogo ? (
              <img
                src={homeLogo}
                alt={`${match.teams.home} Logo`}
                className="rounded-full border-4 border-white bg-white shadow-xl shadow-black/40 w-24 h-24 sm:w-32 sm:h-32 object-contain"
                draggable={false}
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-black text-2xl font-bold">{match.teams.home.charAt(0)}</span>
              </div>
            )}
          </div>
          {/* VS Divider (optional, can add golden vertical line or fade) */}
          <div className="h-24 sm:h-32 border-l-2 border-[#ff5a36] mx-2 opacity-70" />
          {/* Away logo */}
          <div className="flex flex-col items-center">
            {awayLogo ? (
              <img
                src={awayLogo}
                alt={`${match.teams.away} Logo`}
                className="rounded-full border-4 border-white bg-white shadow-xl shadow-black/40 w-24 h-24 sm:w-32 sm:h-32 object-contain"
                draggable={false}
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-black text-2xl font-bold">{match.teams.away.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
