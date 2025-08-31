import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  onError: () => void;
  className?: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, onError, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Native HLS support (Safari)
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
      return;
    }

    // HLS.js for other browsers
    if (Hls.isSupported()) {
      const hls = new Hls({
        // Minimal config for smooth playback
        maxBufferLength: 3,
        maxMaxBufferLength: 6,
        startLevel: 0,
        autoStartLoad: true,
        lowLatencyMode: true
      });
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          onError();
        }
      });

      return () => hls.destroy();
    }
  }, [src, onError]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      autoPlay
      muted={false}
      playsInline
      onError={onError}
    />
  );
};

export default HlsPlayer;