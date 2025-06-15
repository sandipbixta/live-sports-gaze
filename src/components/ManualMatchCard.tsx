
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
      className="flex flex-row rounded-2xl bg-black border border-[#ff5a36] shadow-lg min-h-[320px] w-full max-w-4xl mx-auto overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 170% 80% at 80% 50%, #232323 80%, #181818 100%)',
      }}
    >
      {/* Left Section */}
      <div className="flex flex-col justify-between p-8 w-[350px] min-w-[300px] max-w-[400px] bg-black">
        {/* Top Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-lg font-bold tracking-wide" style={{ letterSpacing: "0.04em" }}>
              TIME
            </span>
            <span className="text-xs font-light tracking-wide bg-black bg-opacity-40 px-2 py-1 rounded text-zinc-200">
              DAMITV
            </span>
            <span className="text-lg font-bold text-[#ff2020] uppercase tracking-widest bg-black bg-opacity-40 px-2 py-1 rounded shadow-sm">
              LIVE
            </span>
          </div>
          {/* Teams */}
          <div className="mt-7 mb-4">
            <div className="text-3xl font-extrabold text-white leading-tight mb-1 uppercase" style={{ letterSpacing: 1 }}>
              {match.teams.home}
            </div>
            <div className="text-[#ff5a36] text-lg font-black uppercase leading-none">vs</div>
            <div className="text-3xl font-extrabold text-white leading-tight mt-1 mb-1 uppercase" style={{ letterSpacing: 1 }}>
              {match.teams.away}
            </div>
          </div>
          {/* Date/Time */}
          <div className="uppercase text-xs font-medium text-zinc-300 tracking-wider mb-1">DATE</div>
          <div className="text-white text-base font-semibold">
            {formatDate(match.date)}
            <br />
            {formatTime(match.date)}
          </div>
        </div>
        {/* Button */}
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

      {/* Right Section (Match Image, much larger and centered) */}
      <div className="relative flex-1 flex items-center justify-center bg-zinc-900 overflow-hidden min-h-[320px]">
        {match.image && match.image !== 'https://imgur.com/undefined' ? (
          <img
            src={match.image}
            alt={match.title}
            className="w-full h-full object-cover object-center rounded-r-2xl"
            style={{
              minHeight: '320px',
              maxHeight: '380px',
              maxWidth: '100%'
            }}
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[#20242d]">
            <span className="text-white/70 text-lg font-semibold">No Image</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualMatchCard;
