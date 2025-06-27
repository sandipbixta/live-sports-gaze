import React, { useRef, useState, useEffect } from 'react';
import { Stream } from '../types/sports';
import { Loader } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { AspectRatio } from './ui/aspect-ratio';
import { useNavigate } from 'react-router-dom';
import { useFullscreenOrientation } from '../hooks/useFullscreenOrientation';
import PlayerContainer from './StreamPlayer/PlayerContainer';
import PlayerControls from './StreamPlayer/PlayerControls';
import LoadingState from './StreamPlayer/LoadingState';
import ErrorState from './StreamPlayer/ErrorState';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading, onRetry }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);
  const [streamDebugInfo, setStreamDebugInfo] = useState<string>('');
  const isMobile = useIsMobile();
  
  // Use the fullscreen orientation hook
  useFullscreenOrientation(stream, videoRef);

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Back button clicked on mobile:', isMobile);
    
    // For mobile, try different navigation methods
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to channels page if no history
      navigate('/channels');
    }
  };
  
  // Function to open stream in new tab as fallback
  const openStreamInNewTab = () => {
    if (stream?.embedUrl) {
      window.open(stream.embedUrl, '_blank');
    }
  };
  
  // Placeholder function for compatibility
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality moved to fullscreen');
  };
  
  // Enhanced debugging and error detection
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      
      // Debug stream information
      const debugInfo = `Stream Debug Info:
        - Source: ${stream.source}
        - ID: ${stream.id}
        - Stream No: ${stream.streamNo}
        - Language: ${stream.language}
        - HD: ${stream.hd}
        - URL: ${stream.embedUrl}
        - URL Protocol: ${stream.embedUrl?.startsWith('https') ? 'HTTPS' : 'HTTP'}
        - Current Site Protocol: ${window.location.protocol}
        - Mobile Device: ${isMobile}
        - User Agent: ${navigator.userAgent}`;
      
      console.log(debugInfo);
      setStreamDebugInfo(debugInfo);
      
      // Check for common issues
      if (window.location.protocol === 'https:' && stream.embedUrl?.startsWith('http:')) {
        console.warn('⚠️ Mixed content issue: HTTPS site trying to load HTTP stream');
      }
    }
  }, [stream, isMobile]);

  // Set timeout for iframe loading on mobile with enhanced debugging
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Iframe loading timeout - this could indicate CORS/X-Frame-Options blocking');
          setIframeTimeout(true);
          setIsContentLoaded(true);
        }
      }, isMobile ? 3000 : 5000);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile]);

  // Handle retry action
  const handleRetry = () => {
    console.log('🔄 Retrying stream load...');
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    if (onRetry) onRetry();
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('✅ Stream iframe loaded successfully');
    setIsContentLoaded(true);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error('❌ Stream iframe failed to load - likely CORS or X-Frame-Options blocking');
    setLoadError(true);
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
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo="Invalid stream URL"
      />
    );
  }

  if (loadError || iframeTimeout) {
    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo={streamDebugInfo}
      />
    );
  }

  return (
    <PlayerContainer>
      <AspectRatio ratio={16 / 9} className="w-full">
        {/* Loading overlay shown until iframe loads or timeout */}
        {!isContentLoaded && !iframeTimeout && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-2 sm:mb-3 text-[#ff5a36]" />
              <p className="text-sm sm:text-lg">Loading stream...</p>
              {isMobile && (
                <p className="text-xs text-gray-400 mt-2">This may take longer on mobile</p>
              )}
            </div>
          </div>
        )}
        
        <iframe 
          ref={videoRef}
          src={stream.embedUrl}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          title="Live Sports Stream"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          style={{ 
            border: 'none',
            // Mobile-specific optimizations
            ...(isMobile && {
              touchAction: 'manipulation',
              WebkitOverflowScrolling: 'touch'
            })
          }}
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

export default StreamPlayer;
