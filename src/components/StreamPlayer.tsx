import React from 'react';
import { Stream } from '../types/sports';
import SimpleVideoPlayer from './StreamPlayer/SimpleVideoPlayer';

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
  return (
    <SimpleVideoPlayer 
      stream={stream}
      isLoading={isLoading}
      onRetry={onRetry}
      isTheaterMode={isTheaterMode}
      onTheaterModeToggle={onTheaterModeToggle}
    />
  );
};

export default StreamPlayer;