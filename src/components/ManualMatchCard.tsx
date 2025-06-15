
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
      className="flex flex-col sm:flex-row rounded-2xl bg-black border border-[#ff5a36] shadow-lg min-h-[480px] w-full max-w-2xl mx-auto overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 170% 80% at 80% 50%, #232323 80%, #181818 100%)',
      }}
    >
      {/* Left Section */}
      <div className="flex flex-col justify-between p-8 sm:w-1/2 w-full bg-black">
        {/* TIME & Match info */}
        <div>
          <div className="text-white text-lg font-bold tracking-wide mb-3" style={{ letterSpacing: "0.04em" }}>
            TIME
          </div>
          <div className="mt-8 mb-6">
            <div className="text-3xl font-extrabold text-white leading-tight mb-2 uppercase" style={{ letterSpacing: 1 }}>
              {match.teams.home}
            </div>
            <div className="text-[#ff5a36] text-[18px] font-black uppercase">vs</div>
            <div className="text-3xl font-extrabold text-white leading-tight mt-2 mb-2 uppercase" style={{ letterSpacing: 1 }}>
              {match.teams.away}
            </div>
          </div>
          <div className="uppercase text-xs font-medium text-zinc-300 tracking-wider mb-1">
            DATE
          </div>
          <div className="text-white text-base font-semibold">
            {formatDate(match.date)}
            <br />
            {formatTime(match.date)}
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate(`/manual-match/${match.id}`)}
            className="w-full text-lg px-0 py-3 bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold rounded-md transition-colors duration-200 shadow uppercase tracking-wide"
            style={{ letterSpacing: 1 }}
          >
            WATCH HERE
          </button>
        </div>
      </div>

      {/* Right Section (Match Image, always visible and contained) */}
      <div className="relative flex-1 sm:w-1/2 w-full flex items-center justify-center bg-zinc-900 rounded-br-2xl rounded-tr-2xl sm:rounded-bl-none overflow-hidden min-h-[480px]">
        {match.image && match.image !== 'https://imgur.com/undefined' ? (
          <img
            src={match.image}
            alt={match.title}
            className="w-full h-full object-contain object-center bg-black"
            style={{ minHeight: '100%', maxHeight: '100%', maxWidth: '100%' }}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[#20242d]">
            <span className="text-white/70 text-lg font-semibold">No Image</span>
          </div>
        )}
        {/* DAMITV & LIVE label (top left/right) */}
        <div className="absolute left-5 top-5 text-zinc-200 text-xs font-light tracking-wide bg-black bg-opacity-40 px-3 py-1 rounded">
          DAMITV
        </div>
        <div className="absolute right-6 top-5 text-lg font-bold text-[#ff2020] uppercase tracking-widest z-20 bg-black bg-opacity-40 px-3 py-1 rounded shadow-sm">
          LIVE
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
