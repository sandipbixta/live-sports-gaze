
import React from 'react';
import { Match } from '../types/sports';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';
import MatchSection from './MatchSection';
import LoadingGrid from './LoadingGrid';
import EmptyState from './EmptyState';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
  onMatchesDisplayed?: (matchIds: string[]) => void;
  trendingSection?: React.ReactNode; // Optional trending section to render between live and upcoming
}

const MatchesList: React.FC<MatchesListProps> = ({ 
  matches, 
  sportId, 
  isLoading,
  onMatchesDisplayed,
  trendingSection
}) => {
  // Filter out advertisement and invalid matches, then consolidate duplicates
  // Show both live and upcoming matches for sports pages
  const cleanMatches = filterCleanMatches(matches);
  const filteredMatches = consolidateMatches(cleanMatches);
  
  // Report displayed match IDs to parent component
  React.useEffect(() => {
    if (onMatchesDisplayed && filteredMatches.length > 0) {
      const displayedIds = filteredMatches.map(match => match.id);
      onMatchesDisplayed(displayedIds);
    }
  }, [filteredMatches, onMatchesDisplayed]);

  if (isLoading) {
    return <LoadingGrid />;
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="bg-[#242836] border-[#343a4d] rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📺</div>
        <h3 className="text-xl font-bold text-white mb-2">No Matches Available</h3>
        <p className="text-gray-400">There are currently no matches available for this sport.</p>
      </div>
    );
  }

  // Separate live and upcoming matches
  const liveMatches = filteredMatches.filter(match => isMatchLive(match));
  const upcomingMatches = filteredMatches.filter(match => !isMatchLive(match));

  return (
    <div>
      {/* Trending Section (if provided) */}
      {trendingSection}
      
      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <>
          <MatchSection
            matches={liveMatches}
            sportId={sportId}
            title="Live Matches"
            isLive={true}
            showEmptyMessage={false}
            emptyMessage=""
          />
          {upcomingMatches.length > 0 && (
            <div className="my-8">
              <div className="h-px bg-[#343a4d]"></div>
            </div>
          )}
        </>
      )}
      
      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <MatchSection
          matches={upcomingMatches}
          sportId={sportId}
          title="Upcoming Matches"
          isLive={false}
          showEmptyMessage={false}
          emptyMessage=""
        />
      )}
    </div>
  );
};

export default MatchesList;
