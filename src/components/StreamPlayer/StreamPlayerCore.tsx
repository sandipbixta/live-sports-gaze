
import React from 'react';
import { Stream } from '../../types/sports';
import { AspectRatio } from '../ui/aspect-ratio';
import { useFullscreenOrientation } from '../../hooks/useFullscreenOrientation';
import PlayerContainer from './PlayerContainer';
import PlayerControls from './PlayerControls';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import StreamOptimizer from './StreamOptimizer';
import StreamIframe from './StreamIframe';

interface StreamPlayerCoreProps {
  stream: Stream | null;
  isLoading: boolean;
  videoRef: React.RefObject<HTMLIFrameElement>;
  loadError: boolean;
  isContentLoaded: boolean;
  iframeTimeout: boolean;
  streamDebugInfo: string;
  mobileStreamBlocked: boolean;
  retryCount: number;
  isMobile: boolean;
  handleGoBack: (e: React.MouseEvent | React.TouchEvent) => void;
  openStreamInNewTab: () => void;
  togglePictureInPicture: () => void;
  handleRetry: () => void;
  handleIframeLoad: () => void;
  handleIframeError: () => void;
}

const StreamPlayerCore: React.FC<StreamPlayerCoreProps> = ({
  stream,
  isLoading,
  videoRef,
  loadError,
  isContentLoaded,
  iframeTimeout,
  streamDebugInfo,
  mobileStreamBlocked,
  retryCount,
  isMobile,
  handleGoBack,
  openStreamInNewTab,
  togglePictureInPicture,
  handleRetry,
  handleIframeLoad,
  handleIframeError
}) => {
  // Use the fullscreen orientation hook
  useFullscreenOrientation(stream, videoRef);

  // Show loading or no stream states
  if (isLoading || !stream) {
    return <LoadingState isLoading={isLoading} hasStream={!!stream} onGoBack={handleGoBack} />;
  }

  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <ErrorState
        hasError={true}
        isTimeout={false}
        onRetry={handleRetry}
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo="Invalid stream URL"
      />
    );
  }

  if (loadError && !mobileStreamBlocked) {
    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo={`Stream failed to load (Retry: ${retryCount})\n\n${streamDebugInfo}`}
      />
    );
  }

  return (
    <PlayerContainer>
      <StreamOptimizer stream={stream} />
      <AspectRatio ratio={16 / 9} className="w-full">
        <StreamIframe
          stream={stream}
          videoRef={videoRef}
          isContentLoaded={isContentLoaded}
          iframeTimeout={iframeTimeout}
          mobileStreamBlocked={mobileStreamBlocked}
          retryCount={retryCount}
          isMobile={isMobile}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </AspectRatio>
      
      <PlayerControls
        onGoBack={handleGoBack}
        onTogglePictureInPicture={togglePictureInPicture}
        onOpenInNewTab={openStreamInNewTab}
        isPictureInPicture={false}
      />
    </PlayerContainer>
  );
};

export default StreamPlayerCore;
