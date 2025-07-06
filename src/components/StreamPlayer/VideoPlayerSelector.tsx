
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
    // Always use iframe for manual channels and TV channels
    if (isManualChannel || isTvChannel) {
      return true;
    }
    
    // Check for direct video file extensions - use HTML5 for these
    const videoExtensions = ['.m3u8', '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      src.toLowerCase().includes(ext.toLowerCase())
    );
    
    if (hasVideoExtension) {
      console.log('Direct video file detected, using HTML5 player');
      return false;
    }
    
    // Check for embed/streaming URLs - use iframe for these
    const embedPatterns = [
      '/embed/',
      'embed.',
      'player.',
      'iframe',
      'stream.php',
      'watch.php',
      'streamingfast',
      'cricfree',
      'buffstreams',
      'reddit',
      'twitch.tv'
    ];
    
    const isEmbedUrl = embedPatterns.some(pattern => 
      src.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Default to iframe for most streaming sites
    return isEmbedUrl || true;
  };

  const useIframe = shouldUseIframe();
  
  console.log(`Video player selection:`, {
    src: src.substring(0, 100) + '...',
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
