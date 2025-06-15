
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

  return (
    <div
      className="flex flex-col sm:flex-row rounded-2xl bg-black overflow-hidden border border-[#ff5a36] shadow-lg min-h-[270px] w-full max-w-3xl mx-auto"
      style={{
        background: 'radial-gradient(ellipse 170% 80% at 80% 50%, #232323 80%, #181818 100%)'
      }}
    >
      {/* Left Section (Details & Button) */}
      <div className="flex flex-col justify-between p-6 sm:w-[45%] w-full bg-black">
        {/* TIME & Match info */}
        <div>
          <div className="text-white text-lg font-bold tracking-wide mb-2" style={{letterSpacing: "0.04em"}}>
            TIME
          </div>
          <div className="mt-6 mb-4">
            <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3 uppercase" style={{ letterSpacing: 1 }}>
              {match.teams.home}
              <br />
              <span className="text-[#ff5a36] text-base font-black">vs</span>
              <br />
              {match.teams.away}
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
            className="w-full text-lg sm:text-base px-0 py-3 bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold rounded-md transition-colors duration-200 shadow uppercase tracking-wide"
          >
            WATCH HERE
          </button>
        </div>
      </div>
      {/* Right Section (Match Image) */}
      <div className="relative flex-1 min-h-[200px] bg-zinc-900">
        {match.image && match.image !== 'https://imgur.com/undefined' ? (
          <img
            src={match.image}
            alt={match.title}
            className="w-full h-full object-cover object-center"
            style={{ minHeight: '100%', maxHeight: 340 }}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[200px] bg-[#20242d]">
            <span className="text-white/70 text-lg font-semibold">No Image</span>
          </div>
        )}
        {/* DAMITV label (top left) */}
        <div className="absolute left-5 top-5 text-zinc-200 text-xs font-light tracking-wide bg-black bg-opacity-40 px-2 py-1 rounded hidden sm:block">
          DAMITV
        </div>
        {/* LIVE label (top right) */}
        <div className="absolute right-6 top-6 text-lg font-bold text-[#ff2020] uppercase tracking-widest z-20 bg-black bg-opacity-40 px-3 py-1 rounded shadow-sm">
          LIVE
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;
