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
  setIsTheaterMode?: (mode: boolean) => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ 
  stream, 
  isLoading, 
  onRetry,
  isManualChannel = false,
  isTvChannel = false,
  title,
  isTheaterMode = false,
  setIsTheaterMode
}) => {
  return (
    <SimpleVideoPlayer 
      stream={stream}
      isLoading={isLoading}
      onRetry={onRetry}
      isTheaterMode={isTheaterMode}
      setIsTheaterMode={setIsTheaterMode}
    />
  );
};

export default StreamPlayer;