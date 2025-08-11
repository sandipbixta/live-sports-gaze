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
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ 
  stream, 
  isLoading, 
  onRetry,
  isManualChannel = false,
  isTvChannel = false,
  title
}) => {
  return (
    <SimpleVideoPlayer 
      stream={stream}
      isLoading={isLoading}
      onRetry={onRetry}
    />
  );
};

export default StreamPlayer;