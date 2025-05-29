
import React, { useRef, useState, useEffect } from 'react';
import { Stream } from '../types/sports';
import { Loader, Video, AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { AspectRatio } from './ui/aspect-ratio';
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
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');
  const isMobile = useIsMobile();
  
  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  // Reset state when stream changes
  useEffect(() => {
    if (stream && stream.embedUrl !== currentEmbedUrl) {
      console.log('Real stream changed, resetting player state. New URL:', stream.embedUrl);
      
      // Validate it's not a demo/YouTube URL
      if (stream.embedUrl.includes('youtube.com') || stream.embedUrl.includes('demo')) {
        console.warn('Demo/YouTube URL detected in player:', stream.embedUrl);
        setLoadError(true);
        return;
      }
      
      setLoadError(false);
      setIsContentLoaded(false);
      setCurrentEmbedUrl(stream.embedUrl);
    }
  }, [stream, currentEmbedUrl]);

  const handleRetry = () => {
    setLoadError(false);
    setIsContentLoaded(false);
    if (onRetry) onRetry();
  };

  const handleIframeLoad = () => {
    console.log('Real stream iframe loaded successfully for URL:', currentEmbedUrl);
    setIsContentLoaded(true);
  };

  const handleIframeError = () => {
    console.error('Real stream iframe failed to load for URL:', currentEmbedUrl);
    setLoadError(true);
  };

  if (isLoading) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-[#ff5a36]" />
              <p className="text-xl">Loading real stream...</p>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  if (!stream || !stream.embedUrl) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-xl">No real stream available</p>
              <p className="text-sm text-gray-400 mt-2">Please try a different source</p>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
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

  // Check if it's a demo/YouTube URL and show error
  if (stream.embedUrl.includes('youtube.com') || stream.embedUrl.includes('demo')) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-xl">Demo stream detected</p>
              <p className="text-sm text-gray-400 mt-2">Please try another source for real streams</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="mt-4 border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
              >
                <RefreshCcw className="h-4 w-4 mr-2" /> Try Real Source
              </Button>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
        </div>
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-xl">Real stream failed to load</p>
              <p className="text-sm text-gray-400 mt-2">Please try another source</p>
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
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl">
      <div className="absolute top-2 left-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      <AspectRatio ratio={16 / 9} className="w-full">
        {!isContentLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
            <div className="text-white text-center">
              <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-[#ff5a36]" />
              <p className="text-xl">Loading real {stream.language} stream...</p>
              <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
            </div>
          </div>
        )}
        
        <iframe 
          key={`real-${stream.id}-${stream.embedUrl}`}
          ref={videoRef}
          src={stream.embedUrl}
          className="w-full h-full absolute inset-0"
          allowFullScreen
          title={`Real Live Stream - ${stream.language}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </AspectRatio>
    </div>
  );
};

export default StreamPlayer;
