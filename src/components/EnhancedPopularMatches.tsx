
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import LiveViewerCounter from './LiveViewerCounter';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';

interface EnhancedPopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const EnhancedPopularMatches: React.FC<EnhancedPopularMatchesProps> = ({ popularMatches, selectedSport }) => {
  const isMobile = useIsMobile();
  
  const filteredMatches = popularMatches
    .filter(match => 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news')
    )
    .sort((a, b) => {
      const aTrending = isTrendingMatch(a.title);
      const bTrending = isTrendingMatch(b.title);
      return bTrending.score - aTrending.score;
    });
  
  if (filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <LiveViewerCounter />
      
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Popular Matches</h2>
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 lg:grid-cols-4 gap-3'}`}>
        {filteredMatches.slice(0, isMobile ? 4 : 8).map((match) => (
          <MatchCard 
            key={`enhanced-popular-${match.id}`}
            match={match}
            sportId={selectedSport || ''}
            isPriority={false}
          />
        ))}
      </div>
    </div>
  );
};

export default EnhancedPopularMatches;
