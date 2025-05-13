
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';
import { Loader } from 'lucide-react';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-[#9b87f5]" />
            <p className="text-xl">Loading stream...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-xl">No live stream available</p>
            <p className="text-sm text-gray-400 mt-2">Check back closer to match time</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have a valid stream URL
  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-xl">Stream unavailable</p>
            <p className="text-sm text-gray-400 mt-2">Please try another source</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl">
      <iframe 
        src={stream.embedUrl}
        className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
        allowFullScreen
        title="Live Sports Stream"
      ></iframe>
    </div>
  );
};

export default StreamPlayer;
