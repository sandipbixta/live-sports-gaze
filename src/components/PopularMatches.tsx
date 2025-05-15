
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { cn } from '../lib/utils';

interface PopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string;
  className?: string;
}

const PopularMatches: React.FC<PopularMatchesProps> = ({ popularMatches, selectedSport, className }) => {
  if (popularMatches.length === 0) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-6 text-center">
        <p className="text-gray-300">No popular matches currently available.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <h2 className="text-xl font-bold mb-4 text-white">Popular Matches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popularMatches.slice(0, 8).map((match) => (
          <MatchCard key={match.id} match={match} sportId={selectedSport} />
        ))}
      </div>
    </div>
  );
};

export default PopularMatches;
