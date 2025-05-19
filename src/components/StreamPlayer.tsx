
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';
import { Loader, Maximize, Minimize, Video, AlertTriangle, RefreshCcw, Fullscreen } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { AspectRatio } from './ui/aspect-ratio';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading, onRetry }) => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  // Toggle picture-in-picture mode
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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    try {
      if (!playerContainerRef.current) return;
      
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) { // Safari
          (playerContainerRef.current as any).webkitRequestFullscreen();
        } else if ((playerContainerRef.current as any).msRequestFullscreen) { // IE11
          (playerContainerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) { // Safari
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) { // IE11
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen mode:', error);
    }
  };
  
  // Update fullscreen state when changed outside our component
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Reset load error when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      
      // Log stream info for debugging
      console.log('StreamPlayer received stream:', stream);
      console.log('Stream embed URL:', stream.embedUrl);
    }
  }, [stream]);

  // Handle retry action
  const handleRetry = () => {
    setLoadError(false);
    setIsContentLoaded(false);
    console.log('Retrying stream playback...');
    if (onRetry) onRetry();
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
  };
  
  // Handle iframe error
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Stream iframe failed to load:', e);
    setLoadError(true);
  };

  // Modify iframe URL to ensure cross-browser compatibility
  const getModifiedEmbedUrl = (url: string) => {
    // Remove autoplay parameters that might cause fullscreen issues in some browsers
    let modifiedUrl = url
      .replace('autoplay=1', 'autoplay=0')
      .replace('&autoplay=1', '')
      .replace('?autoplay=1&', '?')
      .replace('?autoplay=1', '');
      
    // Ensure URL has a protocol
    if (!modifiedUrl.startsWith('http')) {
      modifiedUrl = modifiedUrl.startsWith('//') ? `https:${modifiedUrl}` : `https://${modifiedUrl}`;
    }
    
    return modifiedUrl;
  };

  if (isLoading) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-[#9b87f5]" />
              <p className="text-lg sm:text-xl">Loading stream...</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">This may take a moment</p>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-lg sm:text-xl">No live stream available</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">Check back closer to match time</p>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  // Check if we have a valid stream URL
  const validEmbedUrl = stream.embedUrl && (stream.embedUrl.startsWith('http://') || stream.embedUrl.startsWith('https://'));
  
  if (!validEmbedUrl) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-lg sm:text-xl">Invalid stream URL</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                URL: {stream.embedUrl ? stream.embedUrl.substring(0, 50) + '...' : 'empty'}
              </p>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="mt-4 border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Try Another Source
                </Button>
              )}
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-lg sm:text-xl">Stream failed to load</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">The stream might be temporarily unavailable</p>
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
      </div>
    );
  }

  // Process the embed URL for better cross-browser compatibility
  const processedEmbedUrl = stream.embedUrl ? getModifiedEmbedUrl(stream.embedUrl) : '';

  return (
    <div 
      ref={playerContainerRef}
      className={cn(
        "relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl group",
        isFullscreen && "fixed inset-0 z-50"
      )}
    >
      <AspectRatio ratio={16 / 9} className="w-full">
        {/* Loading overlay shown until iframe loads */}
        {!isContentLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-[#9b87f5]" />
              <p className="text-lg sm:text-xl">Loading stream...</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                Loading from: {stream.source}
              </p>
            </div>
          </div>
        )}
        
        <iframe 
          ref={videoRef}
          src={processedEmbedUrl}
          className="w-full h-full absolute inset-0"
          allowFullScreen={true}
          title="Live Sports Stream"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          loading="lazy"
        ></iframe>
      </AspectRatio>
      
      {/* Controls overlay */}
      <div className={cn(
        "absolute top-2 right-2 sm:top-4 sm:right-4 transition-opacity flex space-x-2",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        {/* Fullscreen button */}
        <button 
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <Fullscreen className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        {/* Picture-in-picture button */}
        <button 
          onClick={togglePictureInPicture}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
          title={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
          aria-label={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
        >
          {isPictureInPicture ? 
            <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : 
            <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
          }
        </button>
      </div>
    </div>
  );
};

export default StreamPlayer;
