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
  // Always use the simplest possible iframe approach
  return (
    <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={src}
        width="100%"
        height="100%"
        allowFullScreen
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