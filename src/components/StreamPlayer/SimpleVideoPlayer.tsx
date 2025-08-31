import React, { useRef, useEffect, useState } from 'react';
import { Stream } from '../../types/sports';
import { Button } from '../ui/button';
import { Play, RotateCcw, Maximize, ExternalLink, Monitor } from 'lucide-react';
import ViewerCounter from '../ViewerCounter';


interface SimpleVideoPlayerProps {
  stream: Stream | null;
  isLoading?: boolean;
  onRetry?: () => void;
  isTheaterMode?: boolean;
  onTheaterModeToggle?: () => void;
  isLive?: boolean;
  viewerCount?: number;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  stream,
  isLoading = false,
  onRetry,
  isTheaterMode = false,
  onTheaterModeToggle,
  isLive = false,
  viewerCount = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        console.log('Fullscreen failed');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-black rounded-lg flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-gray-900 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-white p-6">
          <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Stream Available</h3>
          <p className="text-gray-400 mb-4">Please select a stream source to watch.</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl mx-auto'}`}>
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-lg overflow-hidden ${
          isFullscreen ? 'w-screen h-screen' : 'aspect-video w-full'
        }`}
      >
        {/* Ultra simple iframe - desktop optimized */}
        <iframe
          src={stream.embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          title="Live Stream"
          frameBorder="0"
          scrolling="no"
          loading="eager"
          style={{ 
            border: 'none', 
            background: 'black',
            // Desktop optimization - disable hardware acceleration that can cause issues
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
        />

        {/* Theater mode and fullscreen buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {onTheaterModeToggle && (
            <Button
              onClick={onTheaterModeToggle}
              className={`bg-black/50 hover:bg-black/70 text-white border-0 ${isTheaterMode ? 'bg-blue-600/70 hover:bg-blue-600/90' : ''}`}
              size="sm"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
            size="sm"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>

        {/* Viewer counter overlay */}
        {isLive && (
          <div className="absolute top-4 left-4">
            <ViewerCounter 
              viewerCount={viewerCount > 0 ? viewerCount : Math.floor(Math.random() * 2000) + 800}
              isLive={isLive}
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleVideoPlayer;