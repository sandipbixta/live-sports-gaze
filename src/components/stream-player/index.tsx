
import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Stream } from '../../types/sports';
import { Alert, AlertDescription } from '../ui/alert';
import { useIsMobile } from '../../hooks/use-mobile';

// Import components
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import StreamIframe from './StreamIframe';
import FullscreenControls from './FullscreenControls';
import PictureInPictureControls from './PictureInPictureControls';

// Import hooks
import { useFullscreen } from './useFullscreen';
import { usePictureInPicture } from './usePictureInPicture';
import { useStreamPlayer } from './useStreamPlayer';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ 
  stream, 
  isLoading, 
  onRetry 
}) => {
  const isMobile = useIsMobile();
  const {
    videoRef,
    playerContainerRef,
    loadError,
    isContentLoaded,
    setLoadError,
    handleIframeLoad,
    handleIframeError
  } = useStreamPlayer(stream, isLoading);
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(playerContainerRef);
  const { isPictureInPicture, togglePictureInPicture } = usePictureInPicture(videoRef);

  // Reset error state if stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      console.log('Stream changed, reset errors');
    }
  }, [stream, setLoadError]);

  // Handle retry action
  const handleRetry = () => {
    console.log('Retrying stream playback...');
    setLoadError(false);
    if (onRetry) onRetry();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!stream) {
    return (
      <EmptyState 
        title="No live stream available" 
        subtitle="Check back closer to match time" 
      />
    );
  }

  // Check if stream has error flag or no valid embed URL
  if (stream.error || !stream.embedUrl || stream.embedUrl.length < 5) {
    return (
      <ErrorState 
        message="Stream unavailable"
        subMessage="This stream source may be temporarily unavailable"
        onRetry={onRetry}
      />
    );
  }

  if (loadError) {
    return (
      <ErrorState 
        message="Stream unavailable"
        subMessage="This stream source may be temporarily unavailable"
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-3" id="stream-player">
      <div 
        ref={playerContainerRef}
        className={cn(
          "relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl group",
          isFullscreen && "fixed inset-0 z-50 bg-black"
        )}
      >
        {/* Loading overlay shown until iframe loads */}
        {!isContentLoaded && <LoadingState source={stream.source} />}
        
        <StreamIframe
          stream={stream}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
        
        {/* Controls overlay with improved fullscreen button */}
        <div className={cn(
          "absolute top-2 right-2 sm:top-4 sm:right-4 transition-opacity flex space-x-2",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {/* Fullscreen button */}
          <FullscreenControls
            isFullscreen={isFullscreen}
            playerContainerRef={playerContainerRef}
            toggleFullscreen={toggleFullscreen}
            isMobile={isMobile}
          />
          
          {/* Picture-in-picture button */}
          <PictureInPictureControls
            isPictureInPicture={isPictureInPicture}
            videoRef={videoRef}
            togglePictureInPicture={togglePictureInPicture}
            isMobile={isMobile}
          />
        </div>
      </div>
      
      {/* Browser compatibility notice */}
      <Alert variant="default" className="bg-[#242836] border-[#343a4d] text-gray-300">
        <AlertDescription className="text-center text-xs sm:text-sm">
          If the stream is not working, try another source or reload the page. For better compatibility, use Chrome or Firefox.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StreamPlayer;
