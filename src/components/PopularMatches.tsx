
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';

interface PopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularMatches: React.FC<PopularMatchesProps> = ({ popularMatches, selectedSport }) => {
  // Check if we're on mobile
  const isMobile = useIsMobile();
  
  // Filter out advertisement matches (Sky Sports News in this case)
  const filteredMatches = popularMatches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );
  
  if (filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white">Popular Matches</h2>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        {filteredMatches.slice(0, 6).map((match) => (
          <MatchCard 
            key={`popular-${match.id}`}
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
