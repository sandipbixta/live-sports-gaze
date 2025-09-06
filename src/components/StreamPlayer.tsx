import React from 'react';
import { Stream } from '../types/sports';
import ExtractedVideoPlayer from './StreamPlayer/ExtractedVideoPlayer';
import StreamOptimizer from './StreamPlayer/StreamOptimizer';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
  isManualChannel?: boolean;
  isTvChannel?: boolean;
  title?: string;
  isTheaterMode?: boolean;
  onTheaterModeToggle?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ 
  stream, 
  isLoading, 
  onRetry,
  isManualChannel = false,
  isTvChannel = false,
  title,
  isTheaterMode = false,
  onTheaterModeToggle
}) => {
  if (isLoading) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-black rounded-lg flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream?.embedUrl) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-gray-900 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-white p-6">
          <p className="text-gray-400 mb-4">No stream available. Please select a source.</p>
          {onRetry && (
            <button onClick={onRetry} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <StreamOptimizer stream={stream} />
      <div className={isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'}>
        <ExtractedVideoPlayer 
          embedUrl={stream.embedUrl}
          title={title || "Live Stream"}
          onError={onRetry}
        />
      </div>
    </>
  );
};

export default StreamPlayer;