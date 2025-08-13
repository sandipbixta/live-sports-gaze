
import React from 'react';
import { Match } from '../types/sports';
import ModernMatchCard from './ModernMatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { Clock } from 'lucide-react';

interface MatchSectionProps {
  matches: Match[];
  sportId: string;
  title: string;
  isLive?: boolean;
  showEmptyMessage?: boolean;
  emptyMessage?: string;
}

const MatchSection: React.FC<MatchSectionProps> = ({
  matches,
  sportId,
  title,
  isLive = false,
  showEmptyMessage = false,
  emptyMessage = "No matches available at this time."
}) => {
  const isMobile = useIsMobile();

  if (matches.length === 0 && showEmptyMessage) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
          {isLive ? (
            <span className="inline-block h-3 w-3 bg-[#ff5a36] rounded-full"></span>
          ) : (
            <Clock size={18} className="text-[#1EAEDB]" />
          )}
          {title}
          <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
            0 matches
          </span>
        </h2>
        <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center mb-8">
          <p className="text-gray-300 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
        {isLive ? (
          <span className="inline-block h-3 w-3 bg-[#ff5a36] rounded-full animate-pulse"></span>
        ) : (
          <Clock size={18} className="text-[#1EAEDB]" />
        )}
        {title}
        <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </h2>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 ${isLive ? 'live-matches-grid' : 'upcoming-matches-grid'}`}>
        {matches.map((match, index) => (
          <ModernMatchCard 
            key={`${isLive ? 'live' : 'upcoming'}-${match.id}-${index}`}
            match={match}
            sportId={sportId}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchSection;
