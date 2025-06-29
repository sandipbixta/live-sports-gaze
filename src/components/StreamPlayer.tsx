
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
  const [mobileStreamBlocked, setMobileStreamBlocked] = useState(false);
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
      // For mobile, try to open with different referrer policies
      if (isMobile) {
        // Create a form to submit with no-referrer policy
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = stream.embedUrl;
        form.target = '_blank';
        form.style.display = 'none';
        
        // Add referrer policy
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
  
  // Placeholder function for compatibility
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality moved to fullscreen');
  };
  
  // Enhanced debugging and error detection with mobile-specific checks
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setMobileStreamBlocked(false);
      
      // Debug stream information with mobile-specific checks
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
        - User Agent: ${navigator.userAgent}
        - Viewport: ${window.innerWidth}x${window.innerHeight}
        - Screen: ${screen.width}x${screen.height}`;
      
      console.log(debugInfo);
      setStreamDebugInfo(debugInfo);
      
      // Check for common mobile blocking issues
      if (window.location.protocol === 'https:' && stream.embedUrl?.startsWith('http:')) {
        console.warn('⚠️ Mixed content issue: HTTPS site trying to load HTTP stream');
        if (isMobile) {
          setMobileStreamBlocked(true);
        }
      }
      
      // Check for potential mobile-specific blocking
      if (isMobile && stream.embedUrl) {
        // Some streams block mobile user agents
        const commonMobileBlockingDomains = ['youtube.com', 'vimeo.com', 'dailymotion.com'];
        const streamDomain = new URL(stream.embedUrl).hostname.toLowerCase();
        
        if (commonMobileBlockingDomains.some(domain => streamDomain.includes(domain))) {
          console.warn('⚠️ Stream from domain known to block mobile devices:', streamDomain);
        }
      }
    }
  }, [stream, isMobile]);

  // Set timeout for iframe loading on mobile with enhanced mobile detection
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      // Shorter timeout for mobile due to stricter blocking
      const timeoutDuration = isMobile ? 2000 : 5000;
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Iframe loading timeout - likely blocked on mobile device');
          setIframeTimeout(true);
          setIsContentLoaded(true);
          
          // Set mobile-specific blocking flag
          if (isMobile) {
            setMobileStreamBlocked(true);
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile]);

  // Handle retry action with mobile-specific logic
  const handleRetry = () => {
    console.log('🔄 Retrying stream load...', isMobile ? '(Mobile)' : '(Desktop)');
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    setMobileStreamBlocked(false);
    
    if (onRetry) onRetry();
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('✅ Stream iframe loaded successfully on', isMobile ? 'mobile' : 'desktop');
    setIsContentLoaded(true);
    setMobileStreamBlocked(false);
  };

  // Handle iframe error with mobile-specific messaging
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

  if (loadError || iframeTimeout || mobileStreamBlocked) {
    const errorMessage = mobileStreamBlocked 
      ? "This stream is blocked on mobile devices. Try opening in a new tab or switch to desktop."
      : iframeTimeout 
      ? "Stream loading timed out - likely blocked by the source website"
      : "Stream failed to load";
      
    return (
      <ErrorState
        hasError={true}
        isTimeout={iframeTimeout}
        onRetry={handleRetry}
        onOpenInNewTab={openStreamInNewTab}
        onGoBack={handleGoBack}
        debugInfo={`${errorMessage}\n\n${streamDebugInfo}`}
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
                <p className="text-xs text-gray-400 mt-2">
                  Mobile devices may have longer loading times
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
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          referrerPolicy="no-referrer"
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
