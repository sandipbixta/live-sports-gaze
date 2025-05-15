
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';

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

  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="h-36 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredMatches.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
        <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center">
          <p className="text-gray-300 text-sm">No matches available for this sport right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
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
