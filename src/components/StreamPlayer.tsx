
import React from 'react';
import { Stream } from '../types/sports';
import { useStreamPlayerLogic } from '../hooks/useStreamPlayerLogic';
import StreamPlayerCore from './StreamPlayer/StreamPlayerCore';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading, onRetry }) => {
  const playerLogic = useStreamPlayerLogic({ stream, isLoading, onRetry });

  return (
    <StreamPlayerCore
      stream={stream}
      isLoading={isLoading}
      {...playerLogic}
    />
  );
};

export default StreamPlayer;
