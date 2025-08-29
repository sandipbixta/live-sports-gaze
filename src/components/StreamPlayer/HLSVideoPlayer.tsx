import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
  title?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

const HLSVideoPlayer: React.FC<HLSVideoPlayerProps> = ({
  src,
  onLoad,
  onError,
  title = "Live Stream",
  autoPlay = true,
  controls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    console.log('🎬 Initializing HLS player for:', src);

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        enableSoftwareAES: true,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 2,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        }
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('✅ HLS: Media attached');
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS: Manifest parsed');
        setIsLoading(false);
        setError(null);
        onLoad?.();
        
        if (autoPlay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
          });
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log('✅ HLS: Level loaded');
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('❌ HLS Error:', data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.log('💀 Fatal error, destroying HLS instance');
              setError(`Fatal error: ${data.type}`);
              setIsLoading(false);
              onError?.();
              hls.destroy();
              break;
          }
        }
      });

      // Load the source
      hls.loadSource(src);
      hls.attachMedia(video);

      // Video event listeners
      video.addEventListener('loadstart', () => {
        console.log('📺 Video loading started');
        setIsLoading(true);
      });

      video.addEventListener('canplay', () => {
        console.log('📺 Video can start playing');
        setIsLoading(false);
      });

      video.addEventListener('error', (e) => {
        console.error('📺 Video error:', e);
        setError('Video playback error');
        setIsLoading(false);
        onError?.();
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('🍎 Using native HLS support');
      video.src = src;
      
      video.addEventListener('loadeddata', () => {
        console.log('✅ Native HLS loaded');
        setIsLoading(false);
        onLoad?.();
        
        if (autoPlay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
          });
        }
      });

      video.addEventListener('error', () => {
        console.error('❌ Native HLS error');
        setError('HLS playback not supported');
        setIsLoading(false);
        onError?.();
      });
    } else {
      console.error('❌ HLS not supported');
      setError('HLS playback not supported in this browser');
      setIsLoading(false);
      onError?.();
    }

    return cleanup;
  }, [src, onLoad, onError, autoPlay]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="text-red-400 mb-2">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Stream Error</h3>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-2">Try switching to a different player type</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading HLS stream...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={controls}
        muted={autoPlay} // Required for autoplay
        playsInline
        style={{ backgroundColor: 'black' }}
      />
    </div>
  );
};

export default HLSVideoPlayer;