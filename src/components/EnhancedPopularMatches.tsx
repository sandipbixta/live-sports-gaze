
import React from 'react';
import { Match } from '../types/sports';
import InteractiveMatchCard from './InteractiveMatchCard';
import LiveViewerCounter from './LiveViewerCounter';
import { useIsMobile } from '../hooks/use-mobile';
import { isTrendingMatch } from '../utils/popularLeagues';
import { Flame, Trophy } from 'lucide-react';

interface EnhancedPopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const EnhancedPopularMatches: React.FC<EnhancedPopularMatchesProps> = ({ popularMatches, selectedSport }) => {
  const isMobile = useIsMobile();
  
  // Filter out advertisement matches and prioritize trending matches
  const filteredMatches = popularMatches
    .filter(match => 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news')
    )
    .sort((a, b) => {
      // Sort by trending score (higher score first)
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
      
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Trophy className="h-6 w-6 text-[#ff5a36]" />
            <Flame className="h-3 w-3 text-orange-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">🔥 Trending Matches</h2>
        </div>
        <div className="h-px bg-gradient-to-r from-[#ff5a36] to-transparent flex-1"></div>
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {filteredMatches.slice(0, isMobile ? 4 : 6).map((match, index) => (
          <InteractiveMatchCard 
            key={`enhanced-popular-${match.id}`}
            match={match}
            sportId={selectedSport || ''}
            isPriority={index < 2}
            className={index < 2 ? 'ring-2 ring-[#ff5a36] ring-opacity-50' : ''}
          />
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ff5a36] to-[#e64d2e] text-white px-4 py-2 rounded-full text-sm">
          <Flame className="h-4 w-4 animate-pulse" />
          <span className="font-medium">Live audience engagement: +{Math.floor(Math.random() * 300) + 100}%</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPopularMatches;
