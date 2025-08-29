import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Hls from 'hls.js';

interface IPTVPlayerProps {
  streamUrl: string;
  title?: string;
  onError?: () => void;
  onRetry?: () => void;
  className?: string;
}

const IPTVPlayer: React.FC<IPTVPlayerProps> = ({
  streamUrl,
  title = "IPTV Stream",
  onError,
  onRetry,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setHasError(false);

    // Check if browser supports HLS natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls.isSupported()) {
      // Use HLS.js for browsers that don't support HLS natively
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ IPTV HLS manifest loaded');
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ IPTV HLS Error:', data);
        if (data.fatal) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      });

      return () => hls.destroy();
    } else {
      console.error('❌ HLS not supported');
      setHasError(true);
      setIsLoading(false);
    }
  }, [streamUrl, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };
    const handleError = () => {
      console.error('❌ IPTV Video Error');
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onError]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const hideControls = () => {
      setShowControls(false);
    };

    const showControlsTemporarily = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(hideControls, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControlsTemporarily);
      container.addEventListener('touchstart', showControlsTemporarily);
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', showControlsTemporarily);
        container.removeEventListener('touchstart', showControlsTemporarily);
      }
    };
  }, []);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (error) {
      console.error('❌ Play/Pause error:', error);
      toast({
        title: "Playback Error",
        description: "Unable to control playback. Try refreshing the stream.",
        variant: "destructive",
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('❌ Fullscreen error:', error);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    onRetry?.();
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  if (hasError) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden aspect-video ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-2">Stream Unavailable</h3>
            <p className="text-gray-400 mb-4">This IPTV channel is currently unavailable</p>
            <Button
              onClick={handleRetry}
              className="bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden aspect-video ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="metadata"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm">Loading IPTV stream...</p>
          </div>
        </div>
      )}

      {/* Home Button (Always visible) */}
      <Button
        onClick={handleHomeClick}
        size="sm"
        className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/70 text-white border-0"
      >
        <Home className="h-4 w-4 mr-2" />
        DAMITV
      </Button>

      {/* Live Indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          LIVE
        </div>
      </div>

      {/* Control Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-black/50 hover:bg-black/70 text-white border-0 w-16 h-16 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white border-0"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <span className="text-white text-sm font-medium truncate max-w-[200px]">
                {title}
              </span>
            </div>

            <Button
              onClick={toggleFullscreen}
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white border-0"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPTVPlayer;