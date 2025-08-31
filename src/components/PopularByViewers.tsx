import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { TrendingUp, Users, Loader2 } from 'lucide-react';
import { useMatchesWithViewers } from '@/hooks/useMatchesWithViewers';
import { filterCleanMatches } from '@/utils/matchUtils';

interface PopularByViewersProps {
  matches: Match[];
  onMatchSelect?: (match: Match) => void;
  preventNavigation?: boolean;
}

const PopularByViewers: React.FC<PopularByViewersProps> = ({
  matches,
  onMatchSelect,
  preventNavigation = false
}) => {
  // Filter out women's matches and unwanted content before processing
  const cleanMatches = filterCleanMatches(matches);
  const { matchesWithViewers, loading } = useMatchesWithViewers(cleanMatches);

  // Only show if we have matches with actual viewers (> 0 viewer count)
  const validMatchesWithViewers = matchesWithViewers.filter(match => 
    match.viewerCount && match.viewerCount > 0
  );

  // Don't show section if no matches have real viewers
  if (validMatchesWithViewers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">🔥 Popular by Viewers</h2>
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">({validMatchesWithViewers.length} matches)</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {validMatchesWithViewers.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            sportId={match.sportId || match.category}
            onClick={onMatchSelect ? () => onMatchSelect(match) : undefined}
            preventNavigation={preventNavigation}
            showViewers={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularByViewers;