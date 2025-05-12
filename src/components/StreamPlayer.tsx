
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Live Stream</h2>
        <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sports-primary"></div>
              <p className="mt-4 text-lg">Loading stream...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stream || !stream.embedUrl) {
    return null;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Stream</h2>
      <div className="relative w-full bg-gray-800 rounded-lg overflow-hidden">
        <iframe 
          src={stream.embedUrl}
          className="w-full h-[500px] md:h-[600px] lg:h-[700px]"
          allowFullScreen
          title="Live Sports Stream"
        ></iframe>
      </div>
    </div>
  );
};

export default StreamPlayer;
