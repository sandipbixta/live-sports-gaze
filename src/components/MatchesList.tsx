
import React from 'react';
import { Match } from '../types/sports';
import { consolidateMatches, filterCleanMatches, isMatchLive, sortMatchesByViewers } from '../utils/matchUtils';
import { enrichMatchesWithViewerCounts } from '../utils/viewerCount';
import MatchSection from './MatchSection';
import LoadingGrid from './LoadingGrid';
import AllChannelsGrid from './AllChannelsGrid';
import FeaturedChannels from './FeaturedChannels';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
  onMatchesDisplayed?: (matchIds: string[]) => void;
  trendingSection?: React.ReactNode;
}

const MatchesList: React.FC<MatchesListProps> = ({ 
  matches, 
  sportId, 
  isLoading,
  onMatchesDisplayed,
  trendingSection
}) => {
  const [enrichedMatches, setEnrichedMatches] = React.useState<Match[]>([]);
  const [isEnriching, setIsEnriching] = React.useState(false);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  const consolidatedMatches = React.useMemo(() => {
    const matchesWithSources = matches.filter(m => m.sources && m.sources.length > 0);
    const cleanMatches = filterCleanMatches(matchesWithSources);
    const consolidated = consolidateMatches(cleanMatches);
    console.log(`📊 MatchesList: ${matches.length} → ${matchesWithSources.length} (with sources) → ${consolidated.length} (final)`);
    return consolidated;
  }, [matches]);

  React.useEffect(() => {
    const enrichMatches = async () => {
      if (consolidatedMatches.length === 0) {
        setEnrichedMatches([]);
        setHasInitialized(true);
        return;
      }

      setIsEnriching(true);
      try {
        const matchesWithViewers = await enrichMatchesWithViewerCounts(consolidatedMatches);
        const sortedMatches = sortMatchesByViewers(matchesWithViewers);
        setEnrichedMatches(sortedMatches);
      } catch (error) {
        console.error('Error enriching matches with viewer counts:', error);
        setEnrichedMatches(consolidatedMatches);
      } finally {
        setIsEnriching(false);
        setHasInitialized(true);
      }
    };

    enrichMatches();
  }, [consolidatedMatches]);

  const filteredMatches = enrichedMatches;
  
  React.useEffect(() => {
    if (onMatchesDisplayed && filteredMatches.length > 0) {
      const displayedIds = filteredMatches.map(match => match.id);
      onMatchesDisplayed(displayedIds);
    }
  }, [filteredMatches, onMatchesDisplayed]);

  const liveMatches = filteredMatches.filter(match => isMatchLive(match));
  const upcomingMatches = filteredMatches.filter(match => !isMatchLive(match));

  // Show loading only on initial load, not during enriching to prevent blinking
  if (isLoading && !hasInitialized) {
    return <LoadingGrid />;
  }

  // Show TV channels when no matches are available
  if (hasInitialized && filteredMatches.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground text-sm mb-4">No live matches available right now. Watch live TV channels instead!</p>
          <AllChannelsGrid />
        </div>
        <FeaturedChannels />
      </div>
    );
  }

  return (
    <div>
      <MatchSection
        matches={liveMatches}
        sportId={sportId}
        title="Live Matches"
        isLive={true}
        showEmptyMessage={liveMatches.length === 0 && upcomingMatches.length > 0}
        emptyMessage="No live matches available right now."
      />
      
      {trendingSection}
      
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
