import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { TrendingUp, Users, Loader2 } from 'lucide-react';
import { useMatchesWithViewers } from '@/hooks/useMatchesWithViewers';

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
  const { matchesWithViewers, loading } = useMatchesWithViewers(matches);

  // Don't show section if no matches have viewers
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">🔥 Popular by Viewers</h2>
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        </div>
        <div className="text-center text-muted-foreground py-4">Loading matches with viewers...</div>
      </div>
    );
  }

  if (matchesWithViewers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">🔥 Popular by Viewers</h2>
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">({matchesWithViewers.length} matches)</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {matchesWithViewers.map((match) => (
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