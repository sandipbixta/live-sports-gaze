import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { useIsMobile } from '../../hooks/use-mobile';
import { Play, Pause, Volume2, VolumeX, Maximize, Home, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface Html5VideoPlayerProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  headers?: {
    userAgent?: string;
    referer?: string;
  };
}

const Html5VideoPlayer: React.FC<Html5VideoPlayerProps> = ({ src, onLoad, onError, videoRef, headers }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [hlsError, setHlsError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const hlsRef = useRef<Hls | null>(null);

  // Check if source is HLS
  const isHlsStream = src.includes('.m3u8');

  // Initialize HLS.js for HLS streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsStream) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: (xhr, url) => {
            // Set custom headers if provided
            if (headers?.referer) {
              // Note: Referer header cannot be set via XHR due to browser restrictions
              // The stream needs to work without it or use a proxy
            }
          }
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest parsed successfully');
          video.play().catch(err => console.log('Autoplay prevented:', err));
          onLoad();
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            setHlsError(true);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                onError();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(err => console.log('Autoplay prevented:', err));
          onLoad();
        });
      } else {
        console.error('HLS not supported in this browser');
        onError();
      }
    } else {
      // Regular video source
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isHlsStream, headers, onLoad, onError]);

  // Retry loading
  const handleRetry = () => {
    setHlsError(false);
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Handle home navigation
  const handleHomeClick = () => {
    console.log('DAMITV home button clicked from HTML5 player');
    navigate('/');
  };

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 4000); // Increased to 4 seconds
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Video event handlers
  const handleLoadedData = () => {
    console.log('✅ Video loaded successfully');
    onLoad();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('❌ Video failed to load:', e);
    onError();
  };

  const handlePlay = () => {
    setIsPlaying(true);
    resetControlsTimeout();
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  // Mouse/touch activity handlers
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const handleTouchStart = () => {
    resetControlsTimeout();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden"
      onMouseMove={() => resetControlsTimeout()}
      onTouchStart={() => resetControlsTimeout()}
    >
      {!isHlsStream && (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          controls={false}
          autoPlay
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onLoadedData={handleLoadedData}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
          onVolumeChange={() => {
            if (videoRef.current) {
              setVolume(videoRef.current.volume);
              setIsMuted(videoRef.current.muted);
            }
          }}
        />
      )}
      
      {isHlsStream && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls={false}
          autoPlay
          playsInline
          preload="auto"
          onLoadedData={handleLoadedData}
          onError={handleError}
          onPlay={handlePlay}
          onPause={handlePause}
          onVolumeChange={() => {
            if (videoRef.current) {
              setVolume(videoRef.current.volume);
              setIsMuted(videoRef.current.muted);
            }
          }}
        />
      )}

      {/* HLS Error Retry Button */}
      {hlsError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center">
            <p className="text-white mb-4">Stream failed to load</p>
            <Button onClick={handleRetry} className="bg-primary hover:bg-primary/90">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Always Visible DAMITV Home Button - Top Center */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          variant="ghost"
          onClick={handleHomeClick}
          className="bg-black/80 hover:bg-black/90 text-white px-2 py-1 h-7 flex items-center gap-1 border border-white/20 shadow-lg"
          title="Go to DAMITV Home"
        >
          <Home className="h-3 w-3" />
          <span className="font-bold text-xs">DAMITV</span>
        </Button>
      </div>
      
      {/* Custom Video Controls */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Controls Bar - moved down to avoid overlap */}
        <div className="absolute top-10 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-end">
            {/* Spacer to avoid overlap with always-visible button */}
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Play/Pause Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => {
            if (videoRef.current) {
              if (isPlaying) {
                videoRef.current.pause();
              } else {
                videoRef.current.play();
              }
            }
          }}
        >
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-4">
              <Play className="h-12 w-12 text-white" fill="white" />
            </div>
          )}
        </div>
        
        {/* Bottom Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) {
                    videoRef.current.pause();
                  } else {
                    videoRef.current.play();
                  }
                }
              }}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            {/* Volume Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                {isMuted || volume === 0 ? 
                  <VolumeX className="h-4 w-4" /> : 
                  <Volume2 className="h-4 w-4" />
                }
              </Button>
              
              {!isMobile && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (videoRef.current) {
                      videoRef.current.volume = newVolume;
                      setIsMuted(newVolume === 0);
                    }
                  }}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              )}
            </div>
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    videoRef.current.requestFullscreen();
                  }
                }
              }}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Html5VideoPlayer;
