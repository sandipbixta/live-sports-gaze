import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerSelectorProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
  title?: string;
  isManualChannel?: boolean;
  isTvChannel?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayerSelector: React.FC<VideoPlayerSelectorProps> = ({
  src,
  onLoad,
  onError,
  title = "Live Stream",
  videoRef: externalVideoRef
}) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const hlsRef = useRef<Hls | null>(null);
  
  // Check if it's a direct HLS stream
  const isHlsStream = src.includes('.m3u8');
  
  useEffect(() => {
    if (!isHlsStream || !videoRef.current) return;

    const video = videoRef.current;
    console.log('🎬 Initializing HLS player for:', src);
    
    // Clear any existing source
    video.src = '';
    video.load();

    // Small delay to ensure video element is ready
    const timer = setTimeout(() => {
      if (Hls.isSupported()) {
        console.log('✅ HLS.js is supported, loading stream...');
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          debug: true,
          xhrSetup: (xhr: any) => {
            xhr.withCredentials = false;
          }
        });
        
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest parsed, starting playback...');
          video.play().then(() => {
            console.log('✅ Video playing');
            onLoad?.();
          }).catch(err => {
            console.error('❌ Error playing video:', err);
            onError?.();
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS error:', data);
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
                console.error('💀 Fatal error, cannot recover');
                hls.destroy();
                onError?.();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('✅ Using native HLS support (Safari)');
        video.src = src;
        video.load();
        video.play().then(() => {
          console.log('✅ Video playing (native HLS)');
          onLoad?.();
        }).catch(err => {
          console.error('❌ Error playing video:', err);
          onError?.();
        });
      } else {
        console.error('❌ HLS is not supported in this browser');
        onError?.();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (hlsRef.current) {
        console.log('🧹 Cleaning up HLS instance');
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isHlsStream, onLoad, onError, videoRef]);

  // For HLS streams, render video element
  if (isHlsStream) {
    return (
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        autoPlay
        muted
        preload="auto"
        controlsList="nodownload"
        style={{ 
          border: 'none',
          background: 'black',
          objectFit: 'contain',
          width: '100%',
          height: '100%'
        }}
      />
    );
  }

  // For other streams, use iframe
  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      allowFullScreen
      title={title}
      style={{ 
        border: 'none',
        background: 'black',
        width: '100%',
        height: '100%'
      }}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default VideoPlayerSelector;