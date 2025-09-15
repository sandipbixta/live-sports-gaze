import React, { useRef, useEffect, useState } from 'react';
import { Stream } from '../../types/sports';
import { Button } from '../ui/button';
import { Play, RotateCcw, Maximize, Monitor } from 'lucide-react';

interface SimpleVideoPlayerProps {
  stream: Stream | null;
  isLoading?: boolean;
  onRetry?: () => void;
  isTheaterMode?: boolean;
  onTheaterModeToggle?: () => void;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  stream,
  isLoading = false,
  onRetry,
  isTheaterMode = false,
  onTheaterModeToggle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setIframeLoaded(false);
  }, [stream]);

  const handleRetry = () => {
    setError(false);
    setIframeLoaded(false);
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

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setError(false);
  };

  const handleIframeError = () => {
    setError(true);
  };

  if (isLoading) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-black rounded-2xl flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream || error) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-gray-900 rounded-2xl flex items-center justify-center`}>
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
          <div className="flex items-center justify-center gap-3">
            {onRetry && (
              <Button onClick={handleRetry} variant="outline" className="bg-blue-600 hover:bg-blue-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ensure HTTPS for embedUrl
  const embedUrl = stream.embedUrl.startsWith('http://') 
    ? stream.embedUrl.replace(/^http:\/\//i, 'https://') 
    : stream.embedUrl;

  return (
    <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl mx-auto'}`}>
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden ${
          isFullscreen ? 'w-screen h-screen' : 'aspect-video w-full'
        }`}
      >
        {/* Simple iframe approach */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          width="100%"
          height="100%"
          allowFullScreen
          title="Live Sports Stream"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone"
          referrerPolicy="no-referrer-when-downgrade"
          loading="eager"
          frameBorder="0"
          style={{ 
            border: 'none',
            minWidth: '100%',
            minHeight: '100%'
          }}
        />

        {/* Loading overlay while iframe loads */}
        {!iframeLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default SimpleVideoPlayer;
