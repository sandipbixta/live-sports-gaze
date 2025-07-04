
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
}

const MatchesList: React.FC<MatchesListProps> = ({ 
  matches, 
  sportId, 
  isLoading,
  onMatchesDisplayed
}) => {
  // Filter out advertisement and invalid matches, then consolidate duplicates
  const cleanMatches = filterCleanMatches(matches);
  const filteredMatches = consolidateMatches(cleanMatches);
  
  // Report displayed match IDs to parent component
  React.useEffect(() => {
    if (onMatchesDisplayed && filteredMatches.length > 0) {
      const displayedIds = filteredMatches.map(match => match.id);
      onMatchesDisplayed(displayedIds);
    }
  }, [filteredMatches, onMatchesDisplayed]);

  // Separate matches into live and upcoming
  const liveMatches = filteredMatches.filter(match => isMatchLive(match));
  const upcomingMatches = filteredMatches.filter(match => !isMatchLive(match));

  if (isLoading) {
    return <LoadingGrid />;
  }

  if (filteredMatches.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Live Matches Section */}
      <MatchSection
        matches={liveMatches}
        sportId={sportId}
        title="Live Matches"
        isLive={true}
        showEmptyMessage={liveMatches.length === 0 && upcomingMatches.length > 0}
        emptyMessage="No live matches available right now."
      />
      
      {/* Upcoming Matches Section */}
      <MatchSection
        matches={upcomingMatches}
        sportId={sportId}
        title="Upcoming Matches"
        isLive={false}
        showEmptyMessage={upcomingMatches.length === 0 && liveMatches.length > 0}
        emptyMessage="No upcoming matches scheduled at this time."
      />
    </div>
  );
};

export default MatchesList;
