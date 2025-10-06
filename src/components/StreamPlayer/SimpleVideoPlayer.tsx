import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Stream } from '../../types/sports';
import { Button } from '../ui/button';
import { Play, RotateCcw, Maximize, ExternalLink, Monitor } from 'lucide-react';
import StreamIframe from './StreamIframe';
import StreamQualitySelector from '../StreamQualitySelector';
import ConnectionIndicator from '../ConnectionIndicator';
import BufferIndicator from '../BufferIndicator';
import { getConnectionInfo, getOptimizedHLSConfig, detectCasting, onConnectionChange, detectGeographicLatency } from '../../utils/connectionOptimizer';


interface SimpleVideoPlayerProps {
  stream: Stream | null;
  isLoading?: boolean;
  onRetry?: () => void;
  isTheaterMode?: boolean;
  onTheaterModeToggle?: () => void;
  onAutoFallback?: () => void;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  stream,
  isLoading = false,
  onRetry,
  isTheaterMode = false,
  onTheaterModeToggle,
  onAutoFallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastStreamUrl, setLastStreamUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [availableQualities, setAvailableQualities] = useState<Array<{ width: number; height: number; bitrate: number }>>([]);
  const [connectionInfo, setConnectionInfo] = useState(() => getConnectionInfo());
  const [measuredLatency, setMeasuredLatency] = useState<number | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [autoDowngradeAttempted, setAutoDowngradeAttempted] = useState(false);
  const bufferStallCountRef = useRef(0);
  const isM3U8 = !!stream?.embedUrl && /\.m3u8(\?|$)/i.test(stream.embedUrl || '');
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isCasting = detectCasting();

  // Reset error state and track stream changes
  useEffect(() => {
    if (stream?.embedUrl && stream.embedUrl !== lastStreamUrl) {
      setError(false);
      setErrorCount(0);
      setAutoDowngradeAttempted(false);
      bufferStallCountRef.current = 0;
      setLastStreamUrl(stream.embedUrl);
      console.log('🎬 New stream loaded, resetting error state');
    }
  }, [stream?.embedUrl, lastStreamUrl]);

  // Detect geographic latency on mount
  useEffect(() => {
    detectGeographicLatency().then((latency: number) => {
      setMeasuredLatency(latency);
      console.log('🌍 Measured geographic latency:', latency + 'ms');
      if (latency > 300) {
        console.log('🌐 High latency detected - optimizing for international viewers');
      }
    });
  }, []);

  // Monitor connection changes and update buffering strategy
  useEffect(() => {
    const cleanup = onConnectionChange((newConnectionInfo) => {
      setConnectionInfo(newConnectionInfo);
      console.log('🌐 Connection changed:', newConnectionInfo.effectiveType, `${newConnectionInfo.downlink}Mbps`);
    });
    
    return cleanup;
  }, []);

  const handleRetry = () => {
    setError(false);
    setErrorCount(0);
    if (onRetry) {
      onRetry();
    }
  };

  // Auto-fallback on error
  const handleError = () => {
    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);
    setError(true);
    
    console.log(`❌ Stream error detected (count: ${newErrorCount})`);
    
    // Trigger auto-fallback after first error
    if (newErrorCount === 1 && onAutoFallback) {
      console.log('🔄 Triggering auto-fallback to next source...');
      setTimeout(() => {
        onAutoFallback();
      }, 1500); // Wait 1.5s before trying next source
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
      // Use measured latency if available, otherwise use connection RTT
      const effectiveLatency = measuredLatency || connectionInfo.rtt;
      const adjustedConnectionInfo = { ...connectionInfo, rtt: effectiveLatency };
      
      // Get optimized HLS configuration based on network conditions
      const optimizedConfig = getOptimizedHLSConfig(adjustedConnectionInfo, isCasting);
      
      console.log(`🔧 Initializing HLS with optimized config for ${connectionInfo.effectiveType} connection (${connectionInfo.downlink}Mbps)`);
      console.log(`📊 Buffer settings: ${optimizedConfig.maxBufferLength}s buffer, ${optimizedConfig.maxBufferSize / 1000000}MB max`);
      
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        
        // Connection-optimized configuration
        ...optimizedConfig,
        
        // Fragment loading settings with adaptive timeouts
        fragLoadingRetryDelay: 1000,
        levelLoadingRetryDelay: 1000,
        
        // Quality and performance
        enableSoftwareAES: true,
        startFragPrefetch: true,
        testBandwidth: false,
        capLevelToPlayerSize: false,
        
        // Smart ABR settings based on connection
        abrEwmaDefaultEstimate: connectionInfo.effectiveType === '4g' ? 1000000 : 500000,
        abrEwmaFastLive: 3.0,
        abrEwmaSlowLive: 9.0,
        
        startLevel: -1,  // Auto quality
        autoStartLoad: true,
        progressive: false
      });
      
      // Store reference for quality control
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      // Enhanced error handling with smart recovery
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS error:', data.type, data.details, data.reason);
        
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Network error - attempting recovery...');
              setTimeout(() => hls?.startLoad(), 1000); // Brief delay before retry
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Media error - attempting recovery...');
              hls?.recoverMediaError();
              break;
            default:
              console.log('💥 Fatal error - destroying HLS instance');
              handleError();
              break;
          }
        } else {
          // Handle non-fatal errors
          if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
            console.log('⚠️ Buffer stalled - attempting recovery...');
            hls?.startLoad();
          }
        }
      });

      // Smart quality management
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.log(`📺 HLS manifest parsed: ${data.levels.length} quality levels available`);
        
        // Store available qualities for the selector
        const qualities = data.levels.map(level => ({
          width: level.width,
          height: level.height,
          bitrate: level.bitrate
        }));
        setAvailableQualities(qualities);
        
        // Start with appropriate quality based on connection
        if (hls && hls.levels.length > 1) {
          // Auto quality selection
          hls.currentLevel = -1;
          setCurrentQuality(-1);
          
          // Log available qualities for debugging
          hls.levels.forEach((level, index) => {
            console.log(`Level ${index}: ${level.width}x${level.height} @ ${Math.round(level.bitrate/1000)}kbps`);
          });
        }
      });

      // Monitor buffer health and auto-adjust quality on stalls
      hls.on(Hls.Events.BUFFER_CREATED, () => {
        console.log('✅ HLS buffers created successfully');
      });

      // Detect buffering/waiting states
      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        setIsBuffering(false);
      });

      hls.on(Hls.Events.BUFFER_CODECS, () => {
        setIsBuffering(false);
      });

      // Monitor buffer stalls through error event
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          bufferStallCountRef.current++;
          console.warn(`⚠️ Buffer stall detected (count: ${bufferStallCountRef.current})`);
          
          if (bufferStallCountRef.current >= 3 && !autoDowngradeAttempted && hls.currentLevel > 0) {
            console.log('📉 Auto-downgrading quality due to persistent buffering');
            const newLevel = Math.max(0, hls.currentLevel - 1);
            hls.currentLevel = newLevel;
            setCurrentQuality(newLevel);
            setAutoDowngradeAttempted(true);
            
            // Reset counter after downgrade
            bufferStallCountRef.current = 0;
          }
        }
      });

      // Track quality changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level];
        setCurrentQuality(data.level === -1 ? -1 : data.level + 1); // Adjust for display
        console.log(`🎯 Quality switched to: ${level.width}x${level.height} @ ${Math.round(level.bitrate/1000)}kbps`);
      });

      // Monitor loading progress
      hls.on(Hls.Events.FRAG_LOADED, (_event, data) => {
        if (data.frag.type === 'main') {
          console.log(`📦 Fragment loaded: ${data.frag.sn} (${Math.round(data.frag.duration * 1000)}ms)`);
        }
      });
    }
    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [isM3U8, stream?.embedUrl]);

  // Handle quality change from selector
  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level === -1 ? -1 : level - 1; // Adjust for HLS indexing
      setCurrentQuality(level);
      console.log(`🎮 Manual quality change to: ${level === -1 ? 'Auto' : `Level ${level}`}`);
    }
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
        className={`relative bg-black rounded-2xl overflow-hidden ${
          isFullscreen ? 'w-screen h-screen' : 'aspect-video w-full'
        }`}
      >
      {isM3U8 ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain rounded-2xl"
          controls
          autoPlay
          muted={false}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={handleError}
          onLoadStart={() => console.log('Video load started')}
          onCanPlay={() => {
            console.log('Video can play');
            setIsBuffering(false);
          }}
          onPlaying={() => {
            console.log('Video playing');
            setIsBuffering(false);
          }}
          onWaiting={() => {
            console.log('Video buffering...');
            setIsBuffering(true);
          }}
          onLoadedData={() => {
            console.log('Video data loaded');
            setIsBuffering(false);
          }}
          onProgress={() => console.log('Video buffering progress')}
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
          onError={handleError}
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

      {/* Theater mode, quality selector and fullscreen buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Quality Selector - only show for HLS streams */}
        {isM3U8 && availableQualities.length > 0 && (
          <StreamQualitySelector
            currentLevel={currentQuality}
            availableLevels={availableQualities}
            onQualityChange={handleQualityChange}
          />
        )}
        
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

      {/* Connection Indicator - bottom left */}
      <div className="absolute bottom-4 left-4">
        <ConnectionIndicator />
      </div>

      {/* Buffer Indicator - center overlay */}
      <BufferIndicator isBuffering={isBuffering} />

      </div>
      
    </div>
  );
};

export default SimpleVideoPlayer;