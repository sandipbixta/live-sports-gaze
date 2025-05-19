
import { useState, useEffect, useRef } from 'react';
import { Stream } from '../../types/sports';

export const useStreamPlayer = (stream: Stream | null, isLoading: boolean) => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  
  // Reset load error when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      
      // Log stream info for debugging
      console.log('StreamPlayer received stream:', stream);
      console.log('Stream embed URL:', stream.embedUrl);
    }
  }, [stream]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
  };
  
  // Handle iframe error
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Stream iframe failed to load:', e);
    setLoadError(true);
  };
  
  // Modify iframe URL to ensure cross-browser compatibility
  const getModifiedEmbedUrl = (url: string) => {
    // Remove autoplay parameters that might cause fullscreen issues in some browsers
    let modifiedUrl = url
      .replace('autoplay=1', 'autoplay=0')
      .replace('&autoplay=1', '')
      .replace('?autoplay=1&', '?')
      .replace('?autoplay=1', '');
      
    // Ensure URL has a protocol
    if (!modifiedUrl.startsWith('http')) {
      modifiedUrl = modifiedUrl.startsWith('//') ? `https:${modifiedUrl}` : `https://${modifiedUrl}`;
    }
    
    return modifiedUrl;
  };
  
  return {
    videoRef,
    playerContainerRef,
    loadError,
    setLoadError,
    isContentLoaded,
    handleIframeLoad,
    handleIframeError,
    getModifiedEmbedUrl
  };
};
