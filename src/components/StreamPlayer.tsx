
import React from 'react';
import { Stream } from '../types/sports';
import StreamPlayer from './stream-player';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayerWrapper = ({ 
  stream, 
  isLoading, 
  onRetry 
}: StreamPlayerProps) => {
  console.log('StreamPlayerWrapper received stream:', stream);
  
  return <StreamPlayer stream={stream} isLoading={isLoading} onRetry={onRetry} />;
};

export default StreamPlayerWrapper;
