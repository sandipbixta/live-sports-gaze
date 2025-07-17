
import React, { useRef, useState } from 'react';
import { Stream } from '../types/sports';
import { useNavigate } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { useStreamBypass } from '../hooks/useStreamBypass';
import PlayerContainer from './StreamPlayer/PlayerContainer';
import PlayerControls from './StreamPlayer/PlayerControls';
import LoadingState from './StreamPlayer/LoadingState';
import ErrorState from './StreamPlayer/ErrorState';
import StreamOptimizer from './StreamPlayer/StreamOptimizer';
import VideoPlayerSelector from './StreamPlayer/VideoPlayerSelector';
import StreamLoadingOverlay from './StreamPlayer/StreamLoadingOverlay';

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
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Use custom hooks
  const {
    retryCount,
    useProxyMethod,
    loadError,
    isContentLoaded,
    iframeTimeout,
    maxRetries,
    setLoadError,
    setIsContentLoaded,
    setIframeTimeout,
    refreshStream,
    getVideoUrl
  } = useStreamBypass(stream);

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('StreamPlayer back button clicked');
    
    try {
      navigate(-1);
    } catch (error) {
      console.error('StreamPlayer navigation failed:', error);
      navigate('/channels', { replace: true });
    }
  };

  const forcePlayInSite = () => {
    if (stream?.embedUrl && retryCount < maxRetries) {
      console.log('Forcing stream to play within DAMITV...');
      refreshStream();
    } else {
      console.log('Max retries reached, cannot force play');
    }
  };
  
  const togglePictureInPicture = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.log('Picture-in-Picture not supported or failed:', error);
      }
    }
  };

  const handleRetry = () => {
    console.log('🔄 Manual retry requested...');
    
    if (onRetry && retryCount < 1) {
      onRetry();
    } else if (retryCount < maxRetries) {
      refreshStream();
    } else {
      console.log('Max retries reached, cannot retry');
    }
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setIsContentLoaded(true);
    setIframeTimeout(false);
    setLoadError(false);
  };

  const handleVideoError = () => {
    console.error('❌ Video failed to load');
    
    // Only retry if we haven't exceeded max retries
    if (retryCount < maxRetries) {
      setTimeout(() => {
        refreshStream();
      }, 1500);
    } else {
      console.log('Max retries reached, showing error state');
      setLoadError(true);
      setIframeTimeout(true);
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
        debugInfo="Invalid stream URL"
      />
    );
  }

  // Show error state if we've exceeded retry limits or have persistent errors
  if ((loadError && retryCount >= maxRetries) || (iframeTimeout && retryCount >= maxRetries)) {
    const debugInfo = `Stream Debug Info:
      - Source: ${stream.source}
      - ID: ${stream.id}
      - Stream No: ${stream.streamNo}
      - Language: ${stream.language}
      - HD: ${stream.hd}
      - URL: ${stream.embedUrl?.substring(0, 100)}...
      - Retry Count: ${retryCount}/${maxRetries}
      - Method: ${useProxyMethod ? 'Proxy' : 'Direct'}`;

    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={forcePlayInSite}
        onGoBack={handleGoBack}
        debugInfo={debugInfo}
      />
    );
  }

  const videoUrl = getVideoUrl();

  return (
    <PlayerContainer>
      <StreamOptimizer stream={stream} />
      <AspectRatio ratio={16 / 9} className="w-full">
        {/* Show loading overlay only during initial load */}
        {!isContentLoaded && retryCount === 0 && (
          <StreamLoadingOverlay 
            isVisible={true}
            retryCount={retryCount}
            useProxyMethod={useProxyMethod}
          />
        )}
        
        <VideoPlayerSelector
          src={videoUrl}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          videoRef={videoRef}
          title={title}
          isManualChannel={isManualChannel}
          isTvChannel={isTvChannel}
        />
      </AspectRatio>
      
      <PlayerControls
        onGoBack={handleGoBack}
        onTogglePictureInPicture={togglePictureInPicture}
        onOpenInNewTab={forcePlayInSite}
        isPictureInPicture={!!document.pictureInPictureElement}
      />
    </PlayerContainer>
  );
};

export default StreamPlayer;
