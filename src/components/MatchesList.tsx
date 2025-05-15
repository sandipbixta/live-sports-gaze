
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, sportId, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Live & Upcoming Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Live & Upcoming Matches</h2>
        <div className="bg-[#242836] border-[#343a4d] rounded-xl p-8 text-center">
          <p className="text-gray-300">No matches available for this sport right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white">Live & Upcoming Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard 
            key={match.id}
            match={match}
            sportId={sportId}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchesList;
