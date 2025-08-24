
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';
import { consolidateMatches, filterCleanMatches, filterActiveMatches } from '../utils/matchUtils';

interface PopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string | null;
  excludeMatchIds?: string[]; // Add prop to exclude specific match IDs
}

const PopularMatches: React.FC<PopularMatchesProps> = ({ 
  popularMatches, 
  selectedSport,
  excludeMatchIds = []
}) => {
  const isMobile = useIsMobile();
  
  // Filter out advertisement matches, excluded IDs, and ended matches, then consolidate duplicates properly
  const cleanMatches = filterActiveMatches(filterCleanMatches(
    popularMatches.filter(match => !excludeMatchIds.includes(match.id))
  ));
  
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
      <h2 className="text-xl font-bold mb-3 text-white">Trending Matches</h2>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'} gap-3 md:gap-4`}>
        {filteredMatches.slice(0, 5).map((match, index) => (
          <MatchCard 
            key={`popular-${match.id}-${index}`}
            match={match}
            sportId={selectedSport || ''}
            isPriority={true}
            showViewers={true}
            showShareButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularMatches;
