import React from 'react';
import { Stream } from '../types/sports';
import SimpleVideoPlayer from './StreamPlayer/SimpleVideoPlayer';
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
  viewerCount?: number;
  isLive?: boolean;
  showViewerCounter?: boolean;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ 
  stream, 
  isLoading, 
  onRetry,
  isManualChannel = false,
  isTvChannel = false,
  title,
  isTheaterMode = false,
  onTheaterModeToggle,
  viewerCount = 0,
  isLive = false,
  showViewerCounter = false
}) => {
  return (
    <>
      <StreamOptimizer stream={stream} />
      <SimpleVideoPlayer 
        stream={stream}
        isLoading={isLoading}
        onRetry={onRetry}
        isTheaterMode={isTheaterMode}
        onTheaterModeToggle={onTheaterModeToggle}
        viewerCount={viewerCount}
        isLive={isLive}
        showViewerCounter={showViewerCounter}
      />
    </>
  );
};

export default StreamPlayer;