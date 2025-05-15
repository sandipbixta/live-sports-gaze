
import React from 'react';
import { Match } from '../../types/sports';
import MatchCard from '../MatchCard';

interface LiveMatchesProps {
  liveMatches: Match[];
  selectedSport: string | null;
  onSelectMatch?: (match: Match) => void;
}

const LiveMatches: React.FC<LiveMatchesProps> = ({ liveMatches, selectedSport, onSelectMatch }) => {
  // Filter out advertisement matches
  const filteredMatches = liveMatches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );
  
  if (filteredMatches.length === 0) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-6 text-center">
        <p className="text-gray-300">No live matches currently available.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white flex items-center">
        Live Matches
        <div className="h-1 w-20 bg-[#fa2d04] ml-3 rounded-full"></div>
        <div className="flex items-center ml-3 bg-[#fa2d04]/10 px-2 py-1 rounded-md">
          <span className="w-2 h-2 bg-[#fa2d04] rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm text-[#fa2d04] font-medium">LIVE NOW</span>
        </div>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMatches.map((match) => (
          <MatchCard 
            key={`live-${match.id}`}
            match={match}
            sportId={selectedSport || ''}
            isPriority={true}
            onClick={() => onSelectMatch && onSelectMatch(match)}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveMatches;
