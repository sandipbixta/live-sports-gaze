
import React from 'react';
import { Match } from '../../types/sports';
import MatchCard from '../MatchCard';

interface UpcomingMatchesProps {
  upcomingMatches: Match[];
  selectedSport: string | null;
}

const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({ upcomingMatches, selectedSport }) => {
  // Filter out advertisement matches
  const filteredMatches = upcomingMatches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );
  
  if (filteredMatches.length === 0) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-6 text-center">
        <p className="text-gray-300">No upcoming matches currently available.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-white flex items-center">
        Upcoming Matches
        <div className="h-1 w-20 bg-gray-400 ml-3 rounded-full"></div>
        <div className="flex items-center ml-3 bg-gray-400/10 px-2 py-1 rounded-md">
          <span className="text-sm text-gray-400 font-medium">COMING SOON</span>
        </div>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMatches.map((match) => (
          <MatchCard 
            key={`upcoming-${match.id}`}
            match={match}
            sportId={selectedSport || ''}
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingMatches;
