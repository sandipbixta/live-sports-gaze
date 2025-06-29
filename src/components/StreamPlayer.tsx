
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
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
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
  
  const openStreamInNewTab = () => {
    if (stream?.embedUrl) {
      if (isMobile) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = stream.embedUrl;
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
        window.open(stream.embedUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };
  
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality moved to fullscreen');
  };
  
  // Enhanced debugging with performance timing
  useEffect(() => {
    if (stream) {
      const startTime = performance.now();
      setLoadStartTime(startTime);
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setMobileStreamBlocked(false);
      
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      console.log(`🎬 Stream Loading Started at: ${new Date().toISOString()}`);
      console.log(`⏱️ Performance timestamp: ${startTime}`);
      
      const debugInfo = `Stream Performance Debug:
        - Start Time: ${new Date().toISOString()}
        - Source: ${stream.source}
        - ID: ${stream.id}
        - Stream No: ${stream.streamNo}
        - Language: ${stream.language}
        - HD: ${stream.hd}
        - URL: ${stream.embedUrl}
        - URL Length: ${stream.embedUrl?.length}
        - URL Protocol: ${stream.embedUrl?.startsWith('https') ? 'HTTPS' : 'HTTP'}
        - Current Site Protocol: ${window.location.protocol}
        - Mobile Device: ${isMobile}
        - Mobile User Agent: ${isMobileUserAgent}
        - iOS Device: ${isIOS}
        - Android Device: ${isAndroid}
        - Connection: ${(navigator as any).connection?.effectiveType || 'unknown'}
        - User Agent: ${navigator.userAgent}
        - Viewport: ${window.innerWidth}x${window.innerHeight}`;
      
      console.log(debugInfo);
      setStreamDebugInfo(debugInfo);
      
      // Check for mixed content issues
      if (window.location.protocol === 'https:' && stream.embedUrl?.startsWith('http:')) {
        console.warn('⚠️ Mixed content issue: HTTPS site trying to load HTTP stream');
        if (isMobile) {
          setMobileStreamBlocked(true);
        }
      }
      
      // Preload DNS and connection for the stream domain
      if (stream.embedUrl) {
        try {
          const url = new URL(stream.embedUrl);
          const domain = url.hostname;
          
          // Check if DNS prefetch already exists
          if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
            const prefetch = document.createElement('link');
            prefetch.rel = 'dns-prefetch';
            prefetch.href = `//${domain}`;
            document.head.appendChild(prefetch);
            console.log(`🌐 DNS prefetch added for: ${domain}`);
          }
          
          // Check if preconnect already exists
          if (!document.querySelector(`link[rel="preconnect"][href="${url.origin}"]`)) {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = url.origin;
            preconnect.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect);
            console.log(`🔗 Preconnect added for: ${url.origin}`);
          }
        } catch (error) {
          console.warn('Failed to preload stream domain:', error);
        }
      }
    }
  }, [stream, isMobile]);

  // Optimized timeout with faster mobile detection
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      // Reduced timeout for faster feedback
      const timeoutDuration = isMobile ? 3000 : 8000;
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          const loadTime = performance.now() - loadStartTime;
          console.log(`⏰ Stream timeout after ${loadTime}ms - likely blocked or slow connection`);
          setIframeTimeout(true);
          setIsContentLoaded(true);
          
          if (isMobile) {
            setMobileStreamBlocked(true);
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile, loadStartTime]);

  const handleRetry = () => {
    const retryTime = performance.now();
    console.log(`🔄 Retrying stream at ${new Date().toISOString()}`);
    console.log(`🔄 Retry performance timestamp: ${retryTime}`);
    
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    setMobileStreamBlocked(false);
    setLoadStartTime(retryTime);
    
    if (onRetry) onRetry();
  };

  const handleIframeLoad = () => {
    const loadTime = performance.now() - loadStartTime;
    console.log(`✅ Stream loaded successfully in ${loadTime}ms on ${isMobile ? 'mobile' : 'desktop'}`);
    console.log(`✅ Load completed at: ${new Date().toISOString()}`);
    setIsContentLoaded(true);
    setMobileStreamBlocked(false);
  };

  const handleIframeError = () => {
    const errorTime = performance.now() - loadStartTime;
    console.error(`❌ Stream failed to load after ${errorTime}ms on ${isMobile ? 'mobile' : 'desktop'}`);
    console.error(`❌ Error occurred at: ${new Date().toISOString()}`);
    setLoadError(true);
    
    if (isMobile) {
      setMobileStreamBlocked(true);
    }
  };

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
        debugInfo={`Stream failed to load\n\n${streamDebugInfo}`}
      />
    );
  }

  return (
    <PlayerContainer>
      <StreamOptimizer stream={stream} />
      <AspectRatio ratio={16 / 9} className="w-full">
        {!isContentLoaded && !iframeTimeout && !(mobileStreamBlocked && isMobile) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-2 sm:mb-3 text-[#ff5a36]" />
              <p className="text-sm sm:text-lg">Loading stream...</p>
              <p className="text-xs text-gray-400 mt-1">
                Connecting to {stream.source}...
              </p>
              {isMobile && (
                <p className="text-xs text-gray-400 mt-1">
                  Optimizing for mobile...
                </p>
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
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads"
          referrerPolicy="no-referrer"
          loading="eager"
          importance="high"
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
