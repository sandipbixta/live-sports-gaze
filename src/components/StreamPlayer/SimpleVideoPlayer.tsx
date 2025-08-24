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
  viewerCount?: number;
  isLive?: boolean;
  showViewerCounter?: boolean;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  stream,
  isLoading = false,
  onRetry,
  isTheaterMode = false,
  onTheaterModeToggle,
  viewerCount = 0,
  isLive = false,
  showViewerCounter = false
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

  // Set up HLS for Android/Chrome when URL is .m3u8
  useEffect(() => {
    if (!isM3U8 || !stream?.embedUrl) return;
    const src = stream.embedUrl.startsWith('http://') ? stream.embedUrl.replace(/^http:\/\//i, 'https://') : stream.embedUrl;

    if (videoRef.current && (videoRef.current as any).canPlayType && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = src;
      return;
    }

    let hls: Hls | null = null;
    if (Hls.isSupported() && videoRef.current) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 15, // Reduced buffer for faster startup
        maxMaxBufferLength: 30, // Reduced max buffer
        maxBufferSize: 30 * 1000 * 1000, // 30MB max buffer size
        maxBufferHole: 0.1, // Handle buffer holes very quickly
        highBufferWatchdogPeriod: 1, // Check buffer health every second
        nudgeOffset: 0.05, // Smaller nudge for smoother playback
        nudgeMaxRetry: 5, // More retry attempts
        maxLoadingDelay: 2, // Faster loading
        maxFragLookUpTolerance: 0.1, // Tighter fragment tolerance
        liveSyncDurationCount: 2, // Fewer live sync segments
        liveMaxLatencyDurationCount: 5, // Lower max latency
        enableSoftwareAES: true,
        startFragPrefetch: true,
        testBandwidth: true,
        // Additional buffering optimizations
        backBufferLength: 5, // Keep minimal back buffer
        capLevelToPlayerSize: true, // Match quality to player size
        abrEwmaDefaultEstimate: 500000, // Conservative bandwidth estimate
        abrEwmaFastLive: 2.0, // Faster adaptation for live
        abrEwmaSlowLive: 8.0 // Slower adaptation for stability
      });
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      // Enhanced error handling with recovery
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS error', data);
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, attempting recovery...');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, attempting recovery...');
              hls?.recoverMediaError();
              break;
            default:
              console.log('Fatal error, destroying HLS instance');
              setError(true);
              break;
          }
        }
      });

      // Quality level management for better performance
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, levels:', hls?.levels?.length);
        // Start with auto quality selection
        if (hls && hls.levels.length > 1) {
          hls.currentLevel = -1; // Auto quality
        }
      });
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [isM3U8, stream?.embedUrl]);

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
          onLoadStart={() => console.log('Video load started')}
          onCanPlay={() => console.log('Video can play')}
          onPlaying={() => console.log('Video playing')}
          onWaiting={() => console.log('Video buffering...')}
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

      {/* Viewer counter */}
      {showViewerCounter && (
        <div className="absolute bottom-4 left-4">
          <ViewerCounter 
            viewerCount={viewerCount}
            isLive={isLive}
            variant="default"
            className="bg-black/50 backdrop-blur-sm text-white"
          />
        </div>
      )}
      </div>
      
    </div>
  );
};

export default SimpleVideoPlayer;