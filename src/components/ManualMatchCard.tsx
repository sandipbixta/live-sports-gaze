
import React from 'react';
import { ManualMatch } from '@/types/manualMatch';
import { useNavigate } from 'react-router-dom';

interface ManualMatchCardProps {
  match: ManualMatch;
}

const ManualMatchCard = ({ match }: ManualMatchCardProps) => {
  const navigate = useNavigate();

  // Format time and date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className="flex flex-col rounded-2xl bg-black border border-[#ff5a36] shadow-lg w-full max-w-sm mx-auto overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 170% 80% at 80% 50%, #232323 80%, #181818 100%)',
        minHeight: 480,
      }}
    >
      {/* Image on Top */}
      <div className="relative w-full bg-zinc-900 aspect-video flex items-center justify-center overflow-hidden">
        {match.image && match.image !== 'https://imgur.com/undefined' ? (
          <img
            src={match.image}
            alt={match.title}
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[#20242d] aspect-video">
            <span className="text-white/70 text-lg font-semibold">No Image</span>
          </div>
        )}

        {/* DAMITV label (top left) */}
        <div className="absolute left-4 top-3 text-zinc-200 text-xs font-light tracking-wide bg-black bg-opacity-40 px-2 py-1 rounded">
          DAMITV
        </div>
        {/* LIVE label (top right) */}
        <div className="absolute right-4 top-3 text-lg font-bold text-[#ff2020] uppercase tracking-widest z-20 bg-black bg-opacity-40 px-2 py-1 rounded shadow-sm">
          LIVE
        </div>
      </div>

      {/* Match Details below image */}
      <div className="flex flex-col justify-between flex-1 px-5 py-6 bg-black">
        {/* Match Info */}
        <div>
          {/* TIME */}
          <div className="text-white text-sm font-bold tracking-wide mb-2" style={{ letterSpacing: "0.04em" }}>
            TIME
          </div>
          {/* Teams */}
          <div className="mb-2">
            <div className="text-2xl font-extrabold text-white leading-tight uppercase mb-1" style={{ letterSpacing: 1 }}>
              {match.teams.home}
            </div>
            <div className="text-[#ff5a36] text-base font-black uppercase leading-none">vs</div>
            <div className="text-2xl font-extrabold text-white leading-tight mt-1 uppercase" style={{ letterSpacing: 1 }}>
              {match.teams.away}
            </div>
          </div>

          {/* Date/Time */}
          <div className="uppercase text-xs font-medium text-zinc-300 tracking-wider mb-1">DATE</div>
          <div className="text-white text-base font-semibold mb-1">
            {formatDate(match.date)}
            <br />
            {formatTime(match.date)}
          </div>
        </div>

        {/* Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate(`/manual-match/${match.id}`)}
            className="w-full text-lg px-0 py-3 bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold rounded-md transition-colors duration-200 shadow uppercase tracking-wide"
            style={{ letterSpacing: 1 }}
          >
            WATCH HERE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
