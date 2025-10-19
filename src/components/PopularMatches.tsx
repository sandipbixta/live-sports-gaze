
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';
import { consolidateMatches, filterCleanMatches, filterActiveMatches } from '../utils/matchUtils';
import { enrichMatchesWithViewers, isMatchLive } from '../services/viewerCountService';

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
  const consolidatedMatches = React.useMemo(() => consolidateMatches(cleanMatches), [cleanMatches.length, JSON.stringify(cleanMatches.map(m => m.id))]);

  // Enrich matches with viewer counts from stream API and sort
  React.useEffect(() => {
    const enrichMatches = async () => {
      if (consolidatedMatches.length === 0) {
        setEnrichedMatches([]);
        return;
      }

      setIsLoading(true);
      console.log('🔥 Enriching matches with viewer counts for Popular section:', consolidatedMatches.length);
      try {
        const matchesWithViewers = await enrichMatchesWithViewers(consolidatedMatches);
        
        // Only include live matches with viewer counts
        const liveMatchesWithViewers = matchesWithViewers.filter(m => 
          isMatchLive(m) && 
          (m.viewerCount || 0) > 0
        );
        
        console.log('🔥 Live matches with viewers:', liveMatchesWithViewers.map(m => ({
          title: m.title,
          viewers: m.viewerCount
        })));
        
        // Sort by viewer count descending (highest first)
        const sortedMatches = liveMatchesWithViewers.sort((a, b) => {
          const aViewers = a.viewerCount || 0;
          const bViewers = b.viewerCount || 0;
          return bViewers - aViewers; // Higher viewers first
        });
        
        console.log('🔥 Top 8 matches by viewers:', sortedMatches.slice(0, 8).map(m => ({
          title: m.title,
          viewers: m.viewerCount
        })));
        
        setEnrichedMatches(sortedMatches);
      } catch (error) {
        console.error('Error enriching popular matches:', error);
        // Fallback: filter for live matches without sorting
        const fallbackMatches = consolidatedMatches
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
    
    // Refresh every 60 seconds to get updated viewer counts
    const interval = setInterval(enrichMatches, 60000);
    return () => clearInterval(interval);
  }, [consolidatedMatches]);

  const filteredMatches = enrichedMatches;
  
  if (isLoading || filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔥</span>
        <h2 className="text-2xl font-bold text-white">Popular by Viewers</h2>
        <span className="text-sm px-3 py-1 rounded-full bg-red-600 text-white font-semibold animate-pulse">
          LIVE
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Top live matches sorted by viewer count - updated in real-time
      </p>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'} gap-3 md:gap-4 auto-rows-fr`}>
        {filteredMatches.slice(0, 8).map((match, index) => (
          <div key={`popular-${match.id}-${index}`} className="h-full">
            <MatchCard 
              match={match}
              sportId={selectedSport || ''}
              isPriority={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularMatches;
