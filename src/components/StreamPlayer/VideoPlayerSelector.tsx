
import React from 'react';
import Html5VideoPlayer from './Html5VideoPlayer';
import IframeVideoPlayer from './IframeVideoPlayer';

interface VideoPlayerSelectorProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
  title?: string;
  isManualChannel?: boolean;
  isTvChannel?: boolean;
}

const VideoPlayerSelector: React.FC<VideoPlayerSelectorProps> = ({ 
  src, 
  onLoad, 
  onError, 
  videoRef, 
  title,
  isManualChannel = false,
  isTvChannel = false
}) => {
  // Determine if we should use iframe or HTML5 video player
  const shouldUseIframe = () => {
    // Use iframe for manual channels and TV channels
    if (isManualChannel || isTvChannel) {
      return true;
    }
    
    // Use iframe for embed URLs (common patterns)
    const embedPatterns = [
      '/embed/',
      'embed.',
      'player.',
      'iframe',
      'stream.php',
      'watch.php'
    ];
    
    const isEmbedUrl = embedPatterns.some(pattern => 
      src.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Use HTML5 for direct video files
    const videoExtensions = ['.m3u8', '.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const isDirectVideo = videoExtensions.some(ext => 
      src.toLowerCase().includes(ext)
    );
    
    // Default logic: use iframe for embed-like URLs, HTML5 for direct video
    return isEmbedUrl && !isDirectVideo;
  };

  const useIframe = shouldUseIframe();
  
  console.log(`Video player selection:`, {
    src,
    isManualChannel,
    isTvChannel,
    useIframe,
    playerType: useIframe ? 'iframe' : 'html5'
  });

  if (useIframe) {
    return (
      <IframeVideoPlayer
        src={src}
        onLoad={onLoad}
        onError={onError}
        title={title}
      />
    );
  } else {
    return (
      <Html5VideoPlayer
        src={src}
        onLoad={onLoad}
        onError={onError}
        videoRef={videoRef || React.createRef()}
      />
    );
  }
};

export default VideoPlayerSelector;
