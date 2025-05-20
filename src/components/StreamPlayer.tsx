
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';
import { Loader, Maximize, Minimize, Video, AlertTriangle, RefreshCcw, Eye } from 'lucide-react';
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
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const isMobile = useIsMobile();
  
  // Generate a random but realistic viewer count between 500 and 15000
  useEffect(() => {
    if (stream && !isLoading) {
      // Generate viewer count based on time of day (more viewers during evenings)
      const hour = new Date().getHours();
      const baseViewers = hour >= 18 || hour <= 2 ? 5000 : 2000; // Prime time vs non-prime time
      const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25 multiplier for variety
      const calculatedViewers = Math.floor(baseViewers * randomFactor);
      
      // Add a small random increase every few seconds to simulate real-time changes
      const interval = setInterval(() => {
        setViewerCount(current => {
          const change = Math.floor(Math.random() * 10) - 3; // -3 to +6 viewers
          return Math.max(500, current + change); // Never go below 500 viewers
        });
      }, 5000);
      
      setViewerCount(calculatedViewers);
      
      return () => clearInterval(interval);
    }
  }, [stream, isLoading]);
  
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
    }
  }, [stream]);

  // Handle retry action
  const handleRetry = () => {
    setLoadError(false);
    setIsContentLoaded(false);
    if (onRetry) onRetry();
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
  };

  if (isLoading) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-[#ff5a36]" />
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
  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
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
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl group">
      <AspectRatio ratio={16 / 9} className="w-full">
        {/* Loading overlay shown until iframe loads */}
        {!isContentLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-[#ff5a36]" />
              <p className="text-lg sm:text-xl">Loading stream...</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">This may take a moment</p>
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
          onError={() => setLoadError(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>

        {/* Live viewer count overlay */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-full">
          <Eye className="w-3.5 h-3.5 text-[#ff5a36]" />
          <span className="text-xs font-medium text-white">
            {viewerCount.toLocaleString()} watching
          </span>
        </div>
      </AspectRatio>
      
      {/* Controls overlay */}
      <div className={cn(
        "absolute top-2 right-2 sm:top-4 sm:right-4 transition-opacity",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
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
