import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { getStreamUrl, ExtractedStream } from '../../utils/streamExtractor';

interface ExtractedVideoPlayerProps {
  embedUrl: string;
  title?: string;
  onError?: () => void;
}

const ExtractedVideoPlayer: React.FC<ExtractedVideoPlayerProps> = ({
  embedUrl,
  title = "Live Stream",
  onError
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedStream, setExtractedStream] = useState<ExtractedStream | null>(null);
  const [error, setError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    extractStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [embedUrl]);

  const extractStream = async () => {
    setIsLoading(true);
    setError(false);
    
    try {
      const stream = await getStreamUrl(embedUrl);
      if (stream) {
        setExtractedStream(stream);
        loadStream(stream);
      } else {
        setError(true);
        onError?.();
      }
    } catch (err) {
      console.error('Failed to extract stream:', err);
      setError(true);
      onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  const loadStream = (stream: ExtractedStream) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    if (stream.type === 'hls') {
      // Load HLS stream
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = stream.url;
      } else if (Hls.isSupported()) {
        // Use hls.js for other browsers
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        
        hlsRef.current.loadSource(stream.url);
        hlsRef.current.attachMedia(video);
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            setError(true);
            onError?.();
          }
        });
      }
    } else {
      // Direct MP4 or other formats
      video.src = stream.url;
    }

    // Set volume
    video.volume = volume;
    video.muted = isMuted;
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleRetry = () => {
    setError(false);
    extractStream();
  };

  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (error && !extractedStream) {
    return (
      <div className="relative w-full max-w-5xl mx-auto aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-foreground p-6">
          <h3 className="text-lg font-semibold mb-2">Failed to Extract Stream</h3>
          <p className="text-muted-foreground mb-4">Could not find a playable video stream from the embed URL.</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sports-primary text-foreground rounded-lg hover:bg-sports-primary/80 transition-colors"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto aspect-video bg-background rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        onPlay={handlePlay}
        onPause={handlePause}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        playsInline
        autoPlay
        muted={isMuted}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center text-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sports-primary mx-auto mb-4"></div>
            <p>Extracting stream...</p>
          </div>
        </div>
      )}

      {/* Fixed Home Button */}
      <button
        onClick={handleHomeClick}
        className="absolute top-4 left-4 z-50 bg-background/70 hover:bg-background/90 text-foreground p-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
        title="Go to Home"
      >
        <Home size={20} />
      </button>

      {/* Custom Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between text-foreground">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-muted/40 rounded-full transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-muted/40 rounded-full transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                title="Volume"
              />
            </div>

            {/* Center spacer */}
            <div className="flex-1"></div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-muted/40 rounded-full transition-colors"
                title="Fullscreen"
              >
                <Maximize size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 right-4 bg-sports-primary text-foreground text-xs px-2 py-1 rounded-full font-medium">
        • LIVE
      </div>
    </div>
  );
};

export default ExtractedVideoPlayer;