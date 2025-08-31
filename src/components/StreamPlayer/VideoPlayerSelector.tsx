import React from 'react';

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
  title = "Live Stream"
}) => {
  console.log('🎥 Loading stream URL:', src);
  
  // Check if it's a veplay.top URL and apply specific configuration
  const isVeplayUrl = src.includes('veplay.top');
  
  if (isVeplayUrl) {
    console.log('🌐 Detected veplay.top URL, applying special configuration');
    // Enhanced iframe configuration for veplay.top with all necessary permissions
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        <iframe
          id="player"
          marginHeight={0}
          marginWidth={0}
          src={src}
          scrolling="no"
          allowFullScreen={true}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; microphone; camera; geolocation; gyroscope; accelerometer; payment; usb"
          width="100%"
          height="100%"
          frameBorder="0"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-presentation"
          style={{ 
            position: 'absolute', 
            border: 'none', 
            background: 'black',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          title={title}
          onLoad={() => {
            console.log('✅ Veplay iframe loaded successfully');
            onLoad?.();
          }}
          onError={() => {
            console.error('❌ Veplay iframe failed to load');
            onError?.();
          }}
        />
      </div>
    );
  }
  
  // Default iframe for other URLs
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={src}
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        title={title}
        style={{ 
          border: 'none',
          background: 'black'
        }}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
};

export default VideoPlayerSelector;