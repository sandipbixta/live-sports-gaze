
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
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4 text-white">Live Stream</h2>
          <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sports-primary"></div>
                <p className="mt-4 text-lg">Loading stream...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stream) {
    return null;
  }

  // Check if we have a valid stream URL
  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4 text-white">Live Stream</h2>
          <div className="flex items-center justify-center p-8 text-white">
            <p>No valid stream available. Please try another source.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Live Stream</h2>
        <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
          <iframe 
            src={stream.embedUrl}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px]"
            allowFullScreen
            title="Live Sports Stream"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamPlayer;
