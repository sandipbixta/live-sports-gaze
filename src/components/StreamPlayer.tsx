
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';
import { Loader, Maximize, Minimize, Video, AlertTriangle, RefreshCcw, ArrowLeft, ExternalLink } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { AspectRatio } from './ui/aspect-ratio';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading, onRetry }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);
  const [streamDebugInfo, setStreamDebugInfo] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrientation, setLastOrientation] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  // Mobile-optimized player container with proper orientation
  const PlayerContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="relative w-full bg-[#151922] rounded-none sm:rounded-lg overflow-hidden shadow-xl group">
      {children}
    </div>
  );

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

  // Enhanced mobile fullscreen handling
  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    
    setIsFullscreen(isCurrentlyFullscreen);
    console.log('Fullscreen state changed:', isCurrentlyFullscreen);
    
    // On mobile, when exiting fullscreen, refresh the iframe to prevent playback issues
    if (!isCurrentlyFullscreen && isMobile && videoRef.current) {
      setTimeout(() => {
        if (videoRef.current && stream?.embedUrl) {
          console.log('Refreshing iframe after fullscreen exit on mobile');
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = currentSrc;
            }
          }, 100);
        }
      }, 200);
    }
  };

  // Handle device orientation changes on mobile
  const handleOrientationChange = () => {
    if (!isMobile || !stream) return;
    
    const currentOrientation = window.orientation || screen.orientation?.angle || 0;
    console.log('Orientation changed from', lastOrientation, 'to', currentOrientation);
    
    // If we're in fullscreen and orientation changed, refresh the iframe
    if (isFullscreen && lastOrientation !== null && lastOrientation !== currentOrientation) {
      console.log('Refreshing iframe due to orientation change in fullscreen');
      setTimeout(() => {
        if (videoRef.current && stream?.embedUrl) {
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = currentSrc;
            }
          }, 300);
        }
      }, 500);
    }
    
    setLastOrientation(currentOrientation);
  };

  // Add event listeners for fullscreen and orientation changes
  useEffect(() => {
    // Fullscreen change listeners
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'msfullscreenchange'
    ];
    
    fullscreenEvents.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    // Orientation change listener for mobile
    if (isMobile) {
      window.addEventListener('orientationchange', handleOrientationChange);
      // Also listen to resize as a fallback
      window.addEventListener('resize', handleOrientationChange);
      
      // Set initial orientation
      setLastOrientation(window.orientation || screen.orientation?.angle || 0);
    }

    return () => {
      fullscreenEvents.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
      
      if (isMobile) {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      }
    };
  }, [isMobile, isFullscreen, lastOrientation, stream]);
  
  // Function to open stream in new tab as fallback
  const openStreamInNewTab = () => {
    if (stream?.embedUrl) {
      window.open(stream.embedUrl, '_blank');
    }
  };
  
  const togglePictureInPicture = async () => {
    try {
      // For modern browsers with PiP API
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else if (videoRef.current) {
        // Try to enter PiP mode - this is tricky with iframes but we'll try
        // We need to access the video element inside the iframe
        const iframeDocument = videoRef.current.contentDocument || videoRef.current.contentWindow?.document;
        const videoElement = iframeDocument?.querySelector('video');
        
        if (videoElement && videoElement.requestPictureInPicture) {
          await videoElement.requestPictureInPicture();
          setIsPictureInPicture(true);
        } else {
          console.error('Picture-in-picture not supported or video element not found in iframe');
        }
      }
    } catch (error) {
      console.error('Failed to toggle picture-in-picture mode:', error);
    }
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

  if (isLoading) {
    return (
      <PlayerContainer>
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 touch-manipulation"
            onClick={handleGoBack}
            onTouchEnd={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-[#ff5a36]" />
              <p className="text-lg sm:text-xl">Loading stream...</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">This may take a moment</p>
            </div>
          </div>
        </AspectRatio>
      </PlayerContainer>
    );
  }

  if (!stream) {
    return (
      <PlayerContainer>
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 touch-manipulation"
            onClick={handleGoBack}
            onTouchEnd={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-lg sm:text-xl">No live stream available</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Check back closer to match time</p>
            </div>
          </div>
        </AspectRatio>
      </PlayerContainer>
    );
  }

  // Check if we have a valid stream URL
  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <PlayerContainer>
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 touch-manipulation"
            onClick={handleGoBack}
            onTouchEnd={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-lg sm:text-xl">Invalid stream URL</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Please try another source</p>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="mt-4 border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              )}
            </div>
          </div>
        </AspectRatio>
      </PlayerContainer>
    );
  }

  if (loadError || iframeTimeout) {
    return (
      <PlayerContainer>
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 touch-manipulation"
            onClick={handleGoBack}
            onTouchEnd={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center max-w-md mx-auto p-4">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-lg sm:text-xl mb-2">Stream blocked or unavailable</p>
              <p className="text-xs sm:text-sm text-gray-400 mb-4">
                {iframeTimeout 
                  ? "The stream may be blocked by CORS policy or X-Frame-Options headers"
                  : "Stream failed to load - likely blocked by the source website"
                }
              </p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openStreamInNewTab}
                  className="border-[#ff5a36] bg-transparent hover:bg-[#ff5a36] text-[#ff5a36] hover:text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-xs text-gray-500">Debug Info</summary>
                  <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                    {streamDebugInfo}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </AspectRatio>
      </PlayerContainer>
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
      
      {/* Back button - always visible on mobile */}
      <div className="absolute top-2 left-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 touch-manipulation"
          onClick={handleGoBack}
          onTouchEnd={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      {/* Controls overlay - now always visible on mobile */}
      <div className={cn(
        "absolute top-2 right-2 sm:top-4 sm:right-4 transition-opacity flex gap-2",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button 
          onClick={togglePictureInPicture}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors touch-manipulation"
          title={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
          aria-label={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
        >
          {isPictureInPicture ? 
            <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : 
            <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
          }
        </button>
        
        <button 
          onClick={openStreamInNewTab}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors touch-manipulation"
          title="Open stream in new tab"
          aria-label="Open stream in new tab"
        >
          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </PlayerContainer>
  );
};

export default StreamPlayer;
