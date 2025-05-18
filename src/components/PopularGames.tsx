
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';

interface PopularGamesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularGames: React.FC<PopularGamesProps> = ({ popularMatches, selectedSport }) => {
  const isMobile = useIsMobile();
  
  // Filter out advertisement matches and prioritize trending matches
  const filteredMatches = popularMatches
    .filter(match => 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news')
    )
    .sort((a, b) => {
      // Sort by trending score (higher score first)
      const aTrending = isTrendingMatch(a.title);
      const bTrending = isTrendingMatch(b.title);
      return bTrending.score - aTrending.score;
    });
  
  if (filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white">Trending Games</h2>
      <div className={`grid grid-cols-2 ${!isMobile ? 'md:grid-cols-4' : ''} gap-2`}>
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
