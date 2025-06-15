
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
      className="flex flex-col md:flex-row md:items-stretch rounded-2xl border border-[#ff5a36] bg-[#181818] w-full max-w-3xl mx-auto overflow-hidden shadow-lg"
      style={{
        background: 'radial-gradient(ellipse 170% 80% at 80% 50%, #232323 80%, #181818 100%)',
        minHeight: 260,
      }}
    >
      {/* Image on the left (or top on mobile) */}
      <div className="relative flex-shrink-0 w-full md:w-[350px] xl:w-[400px] aspect-video md:aspect-[16/9] md:min-h-[220px] md:max-h-none bg-zinc-900 flex items-center justify-center overflow-hidden">
        {match.image && match.image !== 'https://imgur.com/undefined' ? (
          <img
            src={match.image}
            alt={match.title}
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-[#20242d]">
            <span className="text-white/70 text-lg font-semibold">No Image</span>
          </div>
        )}

        {/* DAMITV label (top left) */}
        <div className="absolute left-3 top-3 z-10 bg-black/60 px-2 py-1 rounded text-xs text-gray-100 font-bold tracking-wide shadow">
          DAMITV
        </div>
        {/* LIVE label (top right) */}
        <div className="absolute right-3 top-3 z-10 bg-[#ff2020] px-2 py-1 rounded text-xs text-white font-bold tracking-widest shadow animate-pulse-subtle">
          LIVE
        </div>
      </div>

      {/* Details on the right */}
      <div className="flex flex-col flex-1 justify-between px-4 py-6 bg-black">
        <div>
          <div className="mb-3">
            <span className="block text-[13px] font-semibold text-[#ff5a36] tracking-widest mb-1">TIME</span>
            <div className="flex flex-col gap-2">
              <div className="text-3xl font-black text-white uppercase tracking-wider leading-tight">
                {match.teams.home}
              </div>
              <div className="text-xl font-extrabold text-[#ff5a36] uppercase leading-none text-center">VS</div>
              <div className="text-3xl font-black text-white uppercase tracking-wider leading-tight">
                {match.teams.away}
              </div>
            </div>
          </div>
          {match.title && (
            <div className="text-base font-medium text-zinc-200 mb-2 line-clamp-2">{match.title}</div>
          )}
          <div className="flex flex-col gap-0.5 mt-4">
            <span className="uppercase text-xs font-medium text-zinc-400 tracking-widest">Date</span>
            <span className="text-white text-base font-semibold">
              {formatDate(match.date)} &bull; {formatTime(match.date)}
            </span>
          </div>
        </div>
        <div className="mt-6 max-w-xs mx-auto w-full">
          <button
            onClick={() => navigate(`/manual-match/${match.id}`)}
            className="w-full text-lg py-3 bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-bold rounded-md transition-colors duration-200 shadow uppercase tracking-widest"
            style={{ letterSpacing: 2.5 }}
          >
            WATCH HERE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualMatchCard;

