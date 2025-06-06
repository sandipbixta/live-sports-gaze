
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';

interface PopularGamesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularGames: React.FC<PopularGamesProps> = ({ popularMatches, selectedSport }) => {
  const isMobile = useIsMobile();
  
  // Helper function to remove duplicates and prioritize matches with team logos
  const removeDuplicatesAndPrioritizeLogos = (matches: Match[]): Match[] => {
    const matchMap = new Map<string, Match>();
    
    matches.forEach(match => {
      const normalizedTitle = match.title.toLowerCase().trim();
      const hasTeamLogos = match.teams?.home?.badge && match.teams?.away?.badge;
      
      if (!matchMap.has(normalizedTitle)) {
        matchMap.set(normalizedTitle, match);
      } else {
        const existing = matchMap.get(normalizedTitle)!;
        const existingHasLogos = existing.teams?.home?.badge && existing.teams?.away?.badge;
        
        // Replace with current match if it has logos and existing doesn't
        if (hasTeamLogos && !existingHasLogos) {
          matchMap.set(normalizedTitle, match);
        }
      }
    });
    
    return Array.from(matchMap.values());
  };
  
  // Filter out advertisement matches and remove duplicates
  const filteredMatches = removeDuplicatesAndPrioritizeLogos(
    popularMatches.filter(match => 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news')
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
      <h2 className="text-xl font-bold mb-3 text-white">Trending Games</h2>
      <div className={`grid grid-cols-2 ${!isMobile ? 'md:grid-cols-4' : ''} gap-2`}>
        {filteredMatches.slice(0, 4).map((match) => (
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

export default PopularGames;
