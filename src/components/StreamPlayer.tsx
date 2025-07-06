
import React, { useRef, useState } from 'react';
import { Stream } from '../types/sports';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { useFullscreenOrientation } from '../hooks/useFullscreenOrientation';
import { useStreamBypass } from '../hooks/useStreamBypass';
import PlayerContainer from './StreamPlayer/PlayerContainer';
import PlayerControls from './StreamPlayer/PlayerControls';
import LoadingState from './StreamPlayer/LoadingState';
import ErrorState from './StreamPlayer/ErrorState';
import StreamOptimizer from './StreamPlayer/StreamOptimizer';
import StreamIframe from './StreamPlayer/StreamIframe';
import StreamLoadingOverlay from './StreamPlayer/StreamLoadingOverlay';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading, onRetry }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [streamDebugInfo, setStreamDebugInfo] = useState<string>('');
  
  // Use custom hooks
  useFullscreenOrientation(stream, videoRef);
  const {
    retryCount,
    useProxyMethod,
    loadError,
    isContentLoaded,
    iframeTimeout,
    setLoadError,
    setIsContentLoaded,
    setIframeTimeout,
    refreshStream,
    getIframeUrl
  } = useStreamBypass(stream);

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (window.history.length > 2) {
        window.history.back();
      } else {
        navigate('/channels', { replace: true });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/channels';
    }
  };

  const forcePlayInSite = () => {
    if (stream?.embedUrl) {
      console.log('Forcing stream to play within DAMITV...');
      refreshStream();
    }
  };
  
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality moved to fullscreen');
  };

  const handleRetry = () => {
    console.log('🔄 Retrying stream within DAMITV...');
    
    if (onRetry && retryCount < 1) {
      onRetry();
    } else {
      refreshStream();
    }
  };

  const handleIframeLoad = () => {
    console.log('✅ Stream loaded successfully within DAMITV');
    setIsContentLoaded(true);
    setIframeTimeout(false);
  };

  const handleIframeError = () => {
    console.error('❌ Stream failed - trying bypass method');
    if (!useProxyMethod && retryCount < 2) {
      refreshStream();
    } else {
      setLoadError(true);
    }
  };

  // Show loading or no stream states
  if (isLoading || !stream) {
    return <LoadingState isLoading={isLoading} hasStream={!!stream} onGoBack={handleGoBack} />;
  }

  // Check if we have a valid stream URL
  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <ErrorState
        hasError={true}
        isTimeout={false}
        onRetry={handleRetry}
        onOpenInNewTab={forcePlayInSite}
        onGoBack={handleGoBack}
        debugInfo="Invalid stream URL - retrying within DAMITV"
      />
    );
  }

  // Show error state only after multiple bypass attempts
  if (loadError && retryCount > 3) {
    const debugInfo = `Stream Debug Info:
      - Source: ${stream.source}
      - ID: ${stream.id}
      - Stream No: ${stream.streamNo}
      - Language: ${stream.language}
      - HD: ${stream.hd}
      - URL: ${stream.embedUrl}
      - Retry Count: ${retryCount}
      - Bypass Method: ${useProxyMethod ? 'Proxy' : 'Direct'}`;

    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={forcePlayInSite}
        onGoBack={handleGoBack}
        debugInfo={`Tried ${retryCount} bypass methods within DAMITV\n\n${debugInfo}`}
      />
    );
  }

  const iframeUrl = getIframeUrl();

  return (
    <PlayerContainer>
      <StreamOptimizer stream={stream} />
      <AspectRatio ratio={16 / 9} className="w-full">
        <StreamLoadingOverlay 
          isVisible={!isContentLoaded && !iframeTimeout}
          retryCount={retryCount}
          useProxyMethod={useProxyMethod}
        />
        
        <StreamIframe
          src={iframeUrl}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          videoRef={videoRef}
        />
      </AspectRatio>
      
      <PlayerControls
        onGoBack={handleGoBack}
        onTogglePictureInPicture={togglePictureInPicture}
        onOpenInNewTab={forcePlayInSite}
        isPictureInPicture={false}
      />
    </PlayerContainer>
  );
};

export default StreamPlayer;
