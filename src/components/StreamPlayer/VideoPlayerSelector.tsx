import React from 'react';

interface VideoPlayerSelectorProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
  title?: string;
  isManualChannel?: boolean;
  isTvChannel?: boolean;
  isDirectStream?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayerSelector: React.FC<VideoPlayerSelectorProps> = ({
  src,
  onLoad,
  onError,
  title = "Live Stream",
  isDirectStream = false
}) => {
  // If it's a direct stream URL, use video element with HLS support
  if (isDirectStream) {
    return (
      <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden">
        <video
          src={src}
          width="100%"
          height="100%"
          controls
          autoPlay
          muted
          style={{ 
            background: 'black',
            width: '100%',
            height: '100%'
          }}
          onLoadStart={onLoad}
          onError={onError}
        />
      </div>
    );
  }
  
  // For embed URLs, use iframe approach
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