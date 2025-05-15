
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';

interface PopularGamesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularGames: React.FC<PopularGamesProps> = ({ popularMatches, selectedSport }) => {
  // Filter out advertisement matches (Sky Sports News in this case)
  const filteredMatches = popularMatches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );
  
  if (filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white">Popular Games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMatches.slice(0, 4).map((match) => (
          <MatchCard 
            key={`popular-${match.id}`}
            match={match}
            sportId={selectedSport || ''}
            isPriority={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularGames;
