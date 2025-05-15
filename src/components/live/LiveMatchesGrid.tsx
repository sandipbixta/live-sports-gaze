
import React from 'react';
import { Match, Source } from '../../types/sports';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface LiveMatchesGridProps {
  matches: Match[];
  isLoading: boolean;
  onSelectMatch: (match: Match) => void;
  title: string;
  isLive?: boolean;
}

const LiveMatchesGrid: React.FC<LiveMatchesGridProps> = ({ 
  matches, 
  isLoading, 
  onSelectMatch,
  title,
  isLive = false
}) => {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <div className="w-full bg-[#242836] rounded-xl p-6 text-center">
          <p className="text-gray-300">No {isLive ? 'live' : 'upcoming'} matches currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-8 bg-[#1A1F2C] border-[#343a4d]">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white">
          {title}
          <div className="h-1 w-20 bg-[#fa2d04] mt-2 rounded-full"></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matches.map((match) => (
            <div 
              key={match.id} 
              className="bg-[#242836] border-[#343a4d] border rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
              onClick={() => onSelectMatch(match)}
            >
              <div className="p-4">
                <h3 className="font-bold mb-2 text-white">{match.title}</h3>
                <div className="flex items-center">
                  <span className={`w-2 h-2 ${isLive ? 'bg-[#fa2d04]' : 'bg-gray-400'} rounded-full mr-2`}></span>
                  <p className="text-sm text-gray-300">{isLive ? 'Live Now' : 'Coming soon'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveMatchesGrid;
