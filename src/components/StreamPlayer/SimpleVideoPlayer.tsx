import React, { useRef, useEffect, useState } from 'react';
import { Stream } from '../../types/sports';
import { Button } from '../ui/button';
import { Play, RotateCcw, Maximize } from 'lucide-react';

interface SimpleVideoPlayerProps {
  stream: Stream | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  stream,
  isLoading = false,
  onRetry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [stream]);

  const handleRetry = () => {
    setError(false);
    if (onRetry) {
      onRetry();
    }
  };

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
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream || error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white p-6">
          <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            {!stream ? 'No Stream Available' : 'Stream Error'}
          </h3>
          <p className="text-gray-400 mb-4">
            {!stream 
              ? 'Please select a stream source to watch.' 
              : 'Failed to load the stream. Please try again.'
            }
          </p>
          {onRetry && (
            <Button onClick={handleRetry} variant="outline" className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'w-screen h-screen' : 'w-full aspect-video'}`}
    >
      {/* Completely unrestricted iframe */}
      <iframe
        src={stream.embedUrl}
        width="100%"
        height="100%"
        allowFullScreen
        title="Live Stream"
        style={{ 
          border: 'none',
          background: 'black',
          display: 'block'
        }}
        onError={() => setError(true)}
      />
      
      {/* Fullscreen toggle button */}
      <Button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0"
        size="sm"
      >
        <Maximize className="w-4 h-4" />
      </Button>
      
      {/* Stream info overlay */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {stream.language} • {stream.hd ? 'HD' : 'SD'}
      </div>
    </div>
  );
};

export default SimpleVideoPlayer;