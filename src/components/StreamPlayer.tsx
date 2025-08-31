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
  isLive?: boolean;
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
  isLive = false
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
        isLive={isLive}
      />
    </>
  );
};

export default StreamPlayer;