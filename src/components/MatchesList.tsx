
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, sportId, isLoading }) => {
  // Filter out advertisement matches (Sky Sports News in this case)
  const filteredMatches = matches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Live & Upcoming Matches</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-48 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredMatches.length === 0) {
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMatches.map((match) => (
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
