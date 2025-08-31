import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  onError: () => void;
  onBuffering?: () => void;
  className?: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, onError, onBuffering, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bufferCount, setBufferCount] = useState(0);

  useEffect(() => {
    if (!videoRef.current) return;

    console.log('HLS Player: Loading', src);

    // Native HLS support (Safari)
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      console.log('HLS Player: Using native HLS');
      return;
    }

    // HLS.js for other browsers
    if (Hls.isSupported()) {
      console.log('HLS Player: Using HLS.js');
      const hls = new Hls({
        // Ultra minimal config
        maxBufferLength: 1,
        maxMaxBufferLength: 2,
        startLevel: 0,
        autoStartLoad: true,
        lowLatencyMode: true,
        fragLoadingTimeOut: 2000,
        manifestLoadingTimeOut: 2000
      });
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log('HLS Error:', data);
        onError();
      });

      // Monitor buffering
      const video = videoRef.current;
      const handleWaiting = () => {
        console.log('HLS Player: Buffering detected');
        setBufferCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 2 && onBuffering) { // Fallback after just 2 buffers
            console.log('HLS Player: Too much buffering, falling back');
            onBuffering();
          }
          return newCount;
        });
      };

      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('stalled', handleWaiting);

      return () => {
        console.log('HLS Player: Cleanup');
        hls.destroy();
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('stalled', handleWaiting);
      };
    } else {
      console.log('HLS Player: HLS not supported, fallback');
      onError();
    }
  }, [src, onError, onBuffering]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      autoPlay
      muted={false}
      playsInline
      onError={() => {
        console.log('Video element error');
        onError();
      }}
    />
  );
};

export default HlsPlayer;