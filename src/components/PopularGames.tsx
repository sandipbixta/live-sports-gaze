
import React from 'react';
import { Match } from '../types/sports';
import ModernMatchCard from './ModernMatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';
import { consolidateMatches, filterCleanMatches } from '../utils/matchUtils';

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
  
  // Filter out advertisement matches and excluded IDs, then consolidate duplicates properly
  const cleanMatches = filterCleanMatches(
    popularMatches.filter(match => !excludeMatchIds.includes(match.id))
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
      <h2 className="text-xl font-bold mb-3 text-foreground">Trending Games</h2>
      <div className={`grid grid-cols-2 ${!isMobile ? 'md:grid-cols-4' : ''} gap-2`}>
        {filteredMatches.slice(0, 4).map((match, index) => (
          <ModernMatchCard 
            key={`trending-${match.id}-${index}`}
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
