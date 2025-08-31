import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { TrendingUp, Users } from 'lucide-react';
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
  // Filter out women's matches and unwanted content
  const cleanMatches = filterCleanMatches(matches);
  
  // Show popular matches (those marked as popular or with multiple sources)
  const popularMatches = cleanMatches
    .filter(match => match.popular || (match.sources && match.sources.length > 1))
    .slice(0, 12); // Limit to 12 matches

  // Don't show section if no popular matches
  if (popularMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">🔥 Popular Matches</h2>
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">({popularMatches.length} matches)</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {popularMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            sportId={match.sportId || match.category}
            onClick={onMatchSelect ? () => onMatchSelect(match) : undefined}
            preventNavigation={preventNavigation}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularByViewers;