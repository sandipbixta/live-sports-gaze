
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';

interface PopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularMatches: React.FC<PopularMatchesProps> = ({ popularMatches, selectedSport }) => {
  const isMobile = useIsMobile();
  
  // Helper function to remove duplicates more strictly
  const removeDuplicates = (matches: Match[]): Match[] => {
    const seen = new Set<string>();
    const uniqueMatches: Match[] = [];
    
    matches.forEach(match => {
      // Create a unique key based on teams and date
      const homeTeam = match.teams?.home?.name || '';
      const awayTeam = match.teams?.away?.name || '';
      const matchDate = new Date(match.date).toISOString().split('T')[0];
      
      // Use teams and date for uniqueness, fallback to title if no teams
      const uniqueKey = homeTeam && awayTeam 
        ? `${homeTeam}-vs-${awayTeam}-${matchDate}`.toLowerCase()
        : `${match.title}-${matchDate}`.toLowerCase();
      
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueMatches.push(match);
      }
    });
    
    return uniqueMatches;
  };
  
  // Filter out advertisement matches and remove duplicates
  const filteredMatches = removeDuplicates(
    popularMatches.filter(match => 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news') &&
      !match.title.toLowerCase().includes('advertisement') &&
      !match.title.toLowerCase().includes('ad break')
    )
  ).sort((a, b) => {
    // Sort by trending score (higher score first)
    const aTrending = isTrendingMatch(a.title);
    const bTrending = isTrendingMatch(b.title);
    return bTrending.score - aTrending.score;
  });
  
  if (filteredMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white">Trending Matches</h2>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        {filteredMatches.slice(0, 6).map((match, index) => (
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
