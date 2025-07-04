
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
import StreamOptimizer from './StreamPlayer/StreamOptimizer';

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
  const [mobileStreamBlocked, setMobileStreamBlocked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();
  
  // Use the fullscreen orientation hook
  useFullscreenOrientation(stream, videoRef);

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Back button clicked on mobile:', isMobile);
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/channels');
    }
  };
  
  // Function to refresh stream URL and reload iframe
  const refreshStream = () => {
    if (videoRef.current && stream?.embedUrl) {
      console.log('Refreshing stream URL...');
      
      // Force reload the iframe by changing its src
      const currentSrc = videoRef.current.src;
      const url = new URL(currentSrc);
      
      // Add timestamp to force refresh
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_retry', retryCount.toString());
      
      videoRef.current.src = url.toString();
      
      // Reset states
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
    }
  };

  // Function to open stream in new tab as fallback
  const openStreamInNewTab = () => {
    if (stream?.embedUrl) {
      // Add retry parameter to URL for fresh connection
      const url = new URL(stream.embedUrl);
      url.searchParams.set('_t', Date.now().toString());
      
      if (isMobile) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url.toString();
        form.target = '_blank';
        form.style.display = 'none';
        
        const referrerInput = document.createElement('input');
        referrerInput.type = 'hidden';
        referrerInput.name = 'referrer';
        referrerInput.value = 'no-referrer';
        form.appendChild(referrerInput);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
      }
    }
  };
  
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality moved to fullscreen');
  };
  
  // Reset states when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setMobileStreamBlocked(false);
      setRetryCount(0);
      
      // Debug stream information
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
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
        - Mobile User Agent: ${isMobileUserAgent}
        - iOS Device: ${isIOS}
        - Android Device: ${isAndroid}
        - Retry Count: ${retryCount}`;
      
      console.log(debugInfo);
      setStreamDebugInfo(debugInfo);
      
      // Check for mixed content issues
      if (window.location.protocol === 'https:' && stream.embedUrl?.startsWith('http:')) {
        console.warn('⚠️ Mixed content issue: HTTPS site trying to load HTTP stream');
        if (isMobile) {
          setMobileStreamBlocked(true);
        }
      }
    }
  }, [stream, isMobile]);

  // Set timeout for iframe loading with shorter timeout for faster retry
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = isMobile ? 3000 : 5000; // Reduced timeout
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Iframe loading timeout - attempting refresh');
          setIframeTimeout(true);
          
          // Auto-retry once on timeout
          if (retryCount === 0) {
            console.log('Auto-retrying stream...');
            refreshStream();
          } else {
            setIsContentLoaded(true);
            if (isMobile) {
              setMobileStreamBlocked(true);
            }
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile, retryCount]);

  // Enhanced retry handler
  const handleRetry = () => {
    console.log('🔄 Manual retry requested...', isMobile ? '(Mobile)' : '(Desktop)');
    
    if (onRetry && retryCount < 2) {
      // First try the original onRetry (fetch new stream)
      onRetry();
    } else {
      // Then try refreshing the current stream
      refreshStream();
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('✅ Stream iframe loaded successfully on', isMobile ? 'mobile' : 'desktop');
    setIsContentLoaded(true);
    setMobileStreamBlocked(false);
    setIframeTimeout(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error('❌ Stream iframe failed to load on', isMobile ? 'mobile' : 'desktop');
    setLoadError(true);
    
    if (isMobile) {
      setMobileStreamBlocked(true);
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
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo="Invalid stream URL"
      />
    );
  }

  // Show error state for persistent failures (not mobile blocking)
  if (loadError && !mobileStreamBlocked && retryCount > 1) {
    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo={`Stream failed after ${retryCount} retries\n\n${streamDebugInfo}`}
      />
    );
  }

  // Create iframe URL with cache-busting parameters
  const iframeUrl = (() => {
    try {
      const url = new URL(stream.embedUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('muted', '0');
      return url.toString();
    } catch {
      return stream.embedUrl;
    }
  })();

  return (
    <PlayerContainer>
      <StreamOptimizer stream={stream} />
      <AspectRatio ratio={16 / 9} className="w-full">
        {/* Loading overlay */}
        {!isContentLoaded && !iframeTimeout && !(mobileStreamBlocked && isMobile) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-2 sm:mb-3 text-[#ff5a36]" />
              <p className="text-sm sm:text-lg">Loading stream...</p>
              {retryCount > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Retry attempt {retryCount}
                </p>
              )}
              {isMobile && (
                <p className="text-xs text-gray-400 mt-2">
                  Optimizing connection for mobile...
                </p>
              )}
            </div>
          </div>
        )}
        
        <iframe 
          ref={videoRef}
          src={iframeUrl}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          title="Live Sports Stream"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads"
          referrerPolicy="no-referrer"
          loading="eager"
          style={{ 
            border: 'none',
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
