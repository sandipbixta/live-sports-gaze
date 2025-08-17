
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';

interface PopularGamesProps {
  popularMatches: Match[];
  selectedSport: string | null;
  excludeMatchIds?: string[]; // Add prop to exclude specific match IDs
}

const PopularGames: React.FC<PopularGamesProps> = ({ 
  popularMatches, 
  selectedSport,
  excludeMatchIds = []
}) => {
  const isMobile = useIsMobile();
  
  // Filter out advertisement matches, excluded IDs, and non-live matches, then consolidate duplicates properly
  const cleanMatches = filterCleanMatches(
    popularMatches.filter(match => 
      !excludeMatchIds.includes(match.id) && 
      isMatchLive(match) // Only show live matches
    )
  );
  
  // Consolidate matches (merges duplicate matches with their stream sources)
  const consolidatedMatches = consolidateMatches(cleanMatches);
  
  // Sort by trending score (higher score first)
  const filteredMatches = consolidatedMatches.sort((a, b) => {
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
        {filteredMatches.slice(0, 4).map((match, index) => (
           <MatchCard 
            key={`trending-${match.id}-${index}`}
            match={match}
            sportId={selectedSport || ''}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularGames;
