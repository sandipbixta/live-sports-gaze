
import React from 'react';
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
    loadAttempts,
    handleIframeLoad,
    handleIframeError,
    getModifiedEmbedUrl
  } = useStreamPlayer(stream, isLoading);
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(playerContainerRef);
  const { isPictureInPicture, togglePictureInPicture } = usePictureInPicture(videoRef);

  // Handle retry action
  const handleRetry = () => {
    console.log('Retrying stream playback...');
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

  // Check if we have a valid stream URL
  const hasValidEmbedUrl = stream.embedUrl && stream.embedUrl.length > 5;
  
  if (!hasValidEmbedUrl) {
    return (
      <ErrorState 
        message="Stream URL not available"
        subMessage="Please try another source"
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

  // Process the embed URL for better cross-browser compatibility
  const processedEmbedUrl = stream.embedUrl ? getModifiedEmbedUrl(stream.embedUrl) : '';

  return (
    <div className="space-y-3">
      <div 
        ref={playerContainerRef}
        className={cn(
          "relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl group",
          isFullscreen && "fixed inset-0 z-50"
        )}
      >
        {/* Loading overlay shown until iframe loads */}
        {!isContentLoaded && <LoadingState source={stream.source} />}
        
        <StreamIframe
          stream={{...stream, embedUrl: processedEmbedUrl}}
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
          If the stream is not working, please try another source or reload the page. For better compatibility, try using the Brave browser.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StreamPlayer;
