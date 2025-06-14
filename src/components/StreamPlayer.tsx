
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';
import { Loader, Maximize, Minimize, Video, AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react';
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
  
  // Reset load error when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
    }
  }, [stream]);

  // Set timeout for iframe loading on mobile
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('Iframe loading timeout on mobile, setting content as loaded');
          setIframeTimeout(true);
          setIsContentLoaded(true);
        }
      }, isMobile ? 3000 : 5000); // Shorter timeout for mobile

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile]);

  // Handle retry action
  const handleRetry = () => {
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    if (onRetry) onRetry();
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.error('Stream iframe failed to load');
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

  if (loadError) {
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
              <p className="text-lg sm:text-xl">Stream failed to load</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Please refresh or try another source</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mt-4 border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
              >
                <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
              </Button>
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
        "absolute top-2 right-2 sm:top-4 sm:right-4 transition-opacity",
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
      </div>
    </PlayerContainer>
  );
};

export default StreamPlayer;
