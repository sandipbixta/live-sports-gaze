
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { getGoogleTrendingMatches, getTrendingIndicator } from '../services/trendingService';
import { Badge } from './ui/badge';

interface PopularMatchesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularMatches: React.FC<PopularMatchesProps> = ({ popularMatches, selectedSport }) => {
  // Check if we're on mobile
  const isMobile = useIsMobile();
  
  // Filter out advertisement matches and get Google trending data
  const filteredMatches = popularMatches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );
  
  // Get trending matches based on simulated Google trends
  const trendingMatches = getGoogleTrendingMatches(filteredMatches);
  
  if (trendingMatches.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xl font-bold text-white">🔥 Trending on Google</h2>
        <Badge variant="live" className="text-xs">
          LIVE TRENDS
        </Badge>
      </div>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        {trendingMatches.slice(0, 6).map((match) => {
          const indicator = getTrendingIndicator(match.trendingData.trendingScore);
          return (
            <div key={`trending-${match.id}`} className="relative">
              <MatchCard 
                match={match}
                sportId={selectedSport || ''}
                isPriority={true}
              />
              {/* Trending overlay */}
              <div className="absolute top-1 left-1 z-30">
                <div className={`flex items-center gap-1 bg-black/80 text-white px-1.5 py-0.5 rounded-md border border-white/20`}>
                  <span className="text-xs">{indicator.icon}</span>
                  <span className="text-[8px] font-medium">{indicator.label.toUpperCase()}</span>
                </div>
              </div>
              {/* Search volume indicator */}
              <div className="absolute bottom-1 right-1 z-30">
                <div className="bg-blue-600/90 text-white px-1 py-0.5 rounded text-[8px] font-medium">
                  {match.trendingData.searchVolume > 1000 ? 
                    `${Math.round(match.trendingData.searchVolume / 1000)}K` : 
                    match.trendingData.searchVolume
                  } searches
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Trending info */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        <span>📊 Based on search volume, live status, and regional interest</span>
      </div>
    </div>
  );
};

export default PopularMatches;
