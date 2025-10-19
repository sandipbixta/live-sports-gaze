
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';
import { consolidateMatches, filterCleanMatches, filterActiveMatches } from '../utils/matchUtils';
import { enrichMatchesWithViewers, isMatchLive } from '../services/viewerCountService';
import { filterMatchesWithImages } from '../utils/matchImageFilter';

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
  const [enrichedMatches, setEnrichedMatches] = React.useState<Match[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Filter out matches without sources, advertisements, excluded IDs, and ended matches, then consolidate
  const cleanMatches = filterActiveMatches(filterCleanMatches(
    popularMatches
      .filter(match => match.sources && match.sources.length > 0) // CRITICAL: Must have sources
      .filter(match => !excludeMatchIds.includes(match.id))
  ));
  
  // Consolidate matches (merges duplicate matches with their stream sources)
  const consolidatedMatches = consolidateMatches(cleanMatches);
  
  // Only show matches with images on home page
  const matchesWithImages = filterMatchesWithImages(consolidatedMatches);

  // Enrich matches with viewer counts from stream API and sort
  React.useEffect(() => {
    const enrichMatches = async () => {
      if (matchesWithImages.length === 0) {
        setEnrichedMatches([]);
        return;
      }

      setIsLoading(true);
      try {
        const matchesWithViewers = await enrichMatchesWithViewers(matchesWithImages);
        
        // Only include live matches with viewer counts
        const liveMatchesWithViewers = matchesWithViewers.filter(m => 
          isMatchLive(m) && 
          (m.viewerCount || 0) > 0
        );
        
        // Sort by viewer count first, then by trending score
        const sortedMatches = liveMatchesWithViewers.sort((a, b) => {
          const aViewers = a.viewerCount || 0;
          const bViewers = b.viewerCount || 0;
          
          if (aViewers !== bViewers) {
            return bViewers - aViewers; // Higher viewers first
          }
          
          // If viewer counts are equal, sort by trending score
          const aTrending = isTrendingMatch(a.title);
          const bTrending = isTrendingMatch(b.title);
          return bTrending.score - aTrending.score;
        });
        
        setEnrichedMatches(sortedMatches);
      } catch (error) {
        console.error('Error enriching popular matches:', error);
        // Fallback: filter for live matches without sorting
        const fallbackMatches = matchesWithImages
          .filter(m => isMatchLive(m))
          .sort((a, b) => {
            const aTrending = isTrendingMatch(a.title);
            const bTrending = isTrendingMatch(b.title);
            return bTrending.score - aTrending.score;
          });
        setEnrichedMatches(fallbackMatches);
      } finally {
        setIsLoading(false);
      }
    };

    enrichMatches();
  }, [matchesWithImages]);

  const filteredMatches = enrichedMatches;
  
  if (isLoading || filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white">Popular by Viewers</h2>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
        {filteredMatches.slice(0, 5).map((match, index) => (
          <MatchCard 
            key={`popular-${match.id}-${index}`}
            match={match}
            sportId={selectedSport || ''}
            isPriority={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularMatches;
