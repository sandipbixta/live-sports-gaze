import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Stream } from '../../types/sports';
import { Button } from '../ui/button';
import { Play, RotateCcw, Maximize, ExternalLink, Monitor } from 'lucide-react';
import StreamIframe from './StreamIframe';
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
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isM3U8 = !!stream?.embedUrl && /\.m3u8(\?|$)/i.test(stream.embedUrl || '');
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const [showExternal, setShowExternal] = useState(false);
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

  // Fallback to iframe after buffering issues
  const [useIframe, setUseIframe] = useState(false);
  const [bufferCount, setBufferCount] = useState(0);

  // Set up HLS with anti-buffering config
  useEffect(() => {
    if (!isM3U8 || !stream?.embedUrl || useIframe) return;
    const src = stream.embedUrl.startsWith('http://') ? stream.embedUrl.replace(/^http:\/\//i, 'https://') : stream.embedUrl;

    if (videoRef.current && (videoRef.current as any).canPlayType && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = src;
      return;
    }

    let hls: Hls | null = null;
    if (Hls.isSupported() && videoRef.current) {
      hls = new Hls({
        // Minimal settings to prevent buffering
        maxBufferLength: 5,
        maxMaxBufferLength: 10,
        maxBufferSize: 10 * 1000 * 1000,
        maxBufferHole: 0.1,
        lowLatencyMode: true,
        backBufferLength: 10,
        startLevel: 0, // Always start lowest
        autoStartLoad: true,
        fragLoadingTimeOut: 3000,
        manifestLoadingTimeOut: 3000,
        levelLoadingTimeOut: 3000,
        fragLoadingMaxRetry: 0, // No retries
        manifestLoadingMaxRetry: 0,
        levelLoadingMaxRetry: 0,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 2
      });
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      // Track buffering and fallback to iframe
      let bufferTimeout: NodeJS.Timeout;
      hls.on(Hls.Events.ERROR, () => {
        setUseIframe(true); // Instant fallback on any error
      });

      // Monitor stalling
      const video = videoRef.current;
      const handleWaiting = () => {
        setBufferCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setUseIframe(true); // Fallback after 3 buffer events
          }
          return newCount;
        });
      };

      video.addEventListener('waiting', handleWaiting);
      return () => {
        if (hls) hls.destroy();
        video.removeEventListener('waiting', handleWaiting);
        clearTimeout(bufferTimeout);
      };
    }
  }, [isM3U8, stream?.embedUrl, useIframe]);

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

  if (!stream || error) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-gray-900 rounded-lg flex items-center justify-center`}>
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
            {stream?.embedUrl && (
              <a href={stream.embedUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stream
                </Button>
              </a>
            )}
          </div>
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
      {isM3U8 ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted={false}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => setError(true)}
          onCanPlay={() => {
            // Preload next segments for smoother playback
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }}
          style={{ 
            backgroundColor: 'black',
            // Force hardware acceleration
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
        />
      ) : (
        <StreamIframe
          videoRef={iframeRef}
          src={stream.embedUrl.startsWith('http://') ? stream.embedUrl.replace(/^http:\/\//i, 'https://') : stream.embedUrl}
          onLoad={() => setError(false)}
          onError={() => setError(true)}
        />
      )}
      {/* External open fallback on Android for non-m3u8 embeds */}
      {!isM3U8 && isAndroid && (
        <div className="absolute top-4 left-4">
          <Button asChild className="bg-black/50 hover:bg-black/70 text-white border-0" size="sm">
            <a href={stream.embedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </a>
          </Button>
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
      
      {/* Viewer counter below player */}
      {isLive && (
        <div className="mt-3 flex justify-start">
          <ViewerCounter 
            viewerCount={viewerCount || 1250}
            isLive={isLive}
            variant="default"
            className="bg-red-600/20 text-red-400 border-red-600/30"
          />
        </div>
      )}
    </div>
  );
};

export default SimpleVideoPlayer;