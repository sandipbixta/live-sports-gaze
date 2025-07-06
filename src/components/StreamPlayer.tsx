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
  const proxyIframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);
  const [streamDebugInfo, setStreamDebugInfo] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
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
  
  // Enhanced function to create proxy URL to bypass iframe blocking
  const createProxyUrl = (originalUrl: string) => {
    // Method 1: Use a CORS proxy service
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];
    
    return corsProxies[retryCount % corsProxies.length] + encodeURIComponent(originalUrl);
  };

  // Method to inject custom headers to bypass X-Frame-Options
  const createBypassIframe = (url: string) => {
    const bypassHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; }
          iframe { width: 100%; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="${url}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowfullscreen
          referrerpolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
        ></iframe>
        <script>
          // Remove X-Frame-Options header if possible
          try {
            delete window.frameElement;
          } catch(e) {}
        </script>
      </body>
      </html>
    `;
    
    return 'data:text/html;base64,' + btoa(bypassHtml);
  };
  
  // Function to refresh stream URL and try different bypass methods
  const refreshStream = () => {
    if (stream?.embedUrl) {
      console.log('Refreshing stream with bypass methods...');
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      
      // Try different bypass methods based on retry count
      if (retryCount % 3 === 0) {
        console.log('Using direct URL method');
        setUseProxyMethod(false);
      } else if (retryCount % 3 === 1) {
        console.log('Using proxy method');
        setUseProxyMethod(true);
      } else {
        console.log('Using HTML bypass method');
        setUseProxyMethod(false);
      }
    }
  };

  // Function that forces stream to play within DAMITV (no new tab)
  const forcePlayInSite = () => {
    if (stream?.embedUrl) {
      console.log('Forcing stream to play within DAMITV...');
      refreshStream();
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
      setRetryCount(0);
      setUseProxyMethod(false);
      
      // Debug stream information
      const debugInfo = `Stream Debug Info:
        - Source: ${stream.source}
        - ID: ${stream.id}
        - Stream No: ${stream.streamNo}
        - Language: ${stream.language}
        - HD: ${stream.hd}
        - URL: ${stream.embedUrl}
        - Retry Count: ${retryCount}
        - Bypass Method: ${useProxyMethod ? 'Proxy' : 'Direct'}`;
      
      console.log(debugInfo);
      setStreamDebugInfo(debugInfo);
    }
  }, [stream]);

  // Set timeout for iframe loading
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = 8000; // 8 seconds timeout
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Iframe loading timeout - trying bypass method');
          setIframeTimeout(true);
          
          // Auto-retry with different method
          if (retryCount < 3) {
            console.log('Auto-retrying with bypass...');
            refreshStream();
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, retryCount]);

  // Enhanced retry handler that keeps trying within DAMITV
  const handleRetry = () => {
    console.log('🔄 Retrying stream within DAMITV...');
    
    if (onRetry && retryCount < 1) {
      onRetry();
    } else {
      refreshStream();
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('✅ Stream loaded successfully within DAMITV');
    setIsContentLoaded(true);
    setIframeTimeout(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error('❌ Stream failed - trying bypass method');
    if (!useProxyMethod && retryCount < 2) {
      setUseProxyMethod(true);
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
    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={forcePlayInSite}
        onGoBack={handleGoBack}
        debugInfo={`Tried ${retryCount} bypass methods within DAMITV\n\n${streamDebugInfo}`}
      />
    );
  }

  // Create the appropriate iframe URL based on bypass method
  const getIframeUrl = () => {
    try {
      let baseUrl = stream.embedUrl;
      
      // Add cache busting and autoplay parameters
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_retry', retryCount.toString());
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('muted', '0');
      
      // Apply bypass method
      if (useProxyMethod) {
        console.log('Using proxy bypass method');
        return createProxyUrl(url.toString());
      } else if (retryCount > 1) {
        console.log('Using HTML bypass method');
        return createBypassIframe(url.toString());
      } else {
        console.log('Using direct method');
        return url.toString();
      }
    } catch {
      return stream.embedUrl;
    }
  };

  const iframeUrl = getIframeUrl();

  return (
    <PlayerContainer>
      <StreamOptimizer stream={stream} />
      <AspectRatio ratio={16 / 9} className="w-full">
        {/* Loading overlay */}
        {!isContentLoaded && !iframeTimeout && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-2 sm:mb-3 text-[#ff5a36]" />
              <p className="text-sm sm:text-lg">Loading stream within DAMITV...</p>
              {retryCount > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Bypass attempt {retryCount} - Keeping you on DAMITV
                </p>
              )}
              {useProxyMethod && (
                <p className="text-xs text-yellow-400 mt-2">
                  Using advanced bypass method...
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
          title="Live Sports Stream - DAMITV"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-top-navigation"
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
        onOpenInNewTab={forcePlayInSite}
        isPictureInPicture={false}
      />
    </PlayerContainer>
  );
};

export default StreamPlayer;
