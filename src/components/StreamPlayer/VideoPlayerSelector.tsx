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
  // Check if it's a veplay.top URL and apply specific configuration
  const isVeplayUrl = src.includes('veplay.top');
  
  if (isVeplayUrl) {
    // Exact iframe configuration for veplay.top as requested by user
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        <iframe
          id="player"
          marginHeight={0}
          marginWidth={0}
          src={src}
          scrolling="no"
          allowFullScreen={true}
          allow="encrypted-media; picture-in-picture;"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ position: 'absolute', border: 'none', background: 'black' }}
          title={title}
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