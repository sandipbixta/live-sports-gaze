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
  
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        id="player"
        src={src}
        width="100%"
        height="100%"
        allowFullScreen
        allow={isVeplayUrl ? "encrypted-media; picture-in-picture;" : "autoplay; encrypted-media; fullscreen; picture-in-picture"}
        title={title}
        marginHeight={0}
        marginWidth={0}
        scrolling="no"
        frameBorder="0"
        style={{ 
          border: 'none',
          background: 'black',
          position: isVeplayUrl ? 'absolute' : 'static'
        }}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
};

export default VideoPlayerSelector;