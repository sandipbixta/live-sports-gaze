
import React from 'react';
import { Match, Stream } from '../../types/sports';
import StreamPlayer from '../StreamPlayer';

interface LiveFeaturedMatchProps {
  match: Match | null;
  stream: Stream | null;
  isLoading: boolean;
  streamLoading: boolean;
}

const LiveFeaturedMatch: React.FC<LiveFeaturedMatchProps> = ({ 
  match, 
  stream, 
  isLoading,
  streamLoading 
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fa2d04] mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading live streams...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
        <p className="text-gray-300">No live streams available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-white">{match.title}</h2>
      <StreamPlayer 
        stream={stream} 
        isLoading={streamLoading} 
      />
    </div>
  );
};

export default LiveFeaturedMatch;
