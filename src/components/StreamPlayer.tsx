
import StreamPlayer from './stream-player';
import { Stream } from '../types/sports';

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
  return <StreamPlayer stream={stream} isLoading={isLoading} onRetry={onRetry} />;
};

export default StreamPlayerWrapper;
