
import { useState, useEffect, useRef } from 'react';
import { Stream } from '../../types/sports';

export const useStreamPlayer = (stream: Stream | null, isLoading: boolean) => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Reset load error when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      setLoadAttempts(prev => prev + 1);
      
      // Log stream info for debugging
      console.log('StreamPlayer received stream:', stream);
      console.log('Stream embed URL:', stream.embedUrl);
    }
  }, [stream]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
    
    // Check if iframe is actually working after a brief delay
    setTimeout(() => {
      const iframe = videoRef.current;
      if (iframe) {
        try {
          // Try to access iframe to see if it's working
          const iframeWindow = iframe.contentWindow;
          if (!iframeWindow) {
            console.warn('Iframe content window not available - possible CORS issue');
          }
        } catch (error) {
          console.error('Error accessing iframe content:', error);
        }
      }
    }, 2000);
  };
  
  // Handle iframe error
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Stream iframe failed to load:', e);
    setLoadError(true);
  };
  
  // Modify iframe URL to ensure cross-browser compatibility
  const getModifiedEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Fix common URL issues
    let modifiedUrl = url
      .replace(/&amp;/g, '&')  // Fix encoded ampersands
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace
      
    // Ensure URL has proper protocol
    if (!modifiedUrl.startsWith('http')) {
      modifiedUrl = modifiedUrl.startsWith('//') ? `https:${modifiedUrl}` : `https://${modifiedUrl}`;
    }
    
    // Handle YouTube URLs for better compatibility
    if (modifiedUrl.includes('youtube.com')) {
      if (!modifiedUrl.includes('?')) modifiedUrl += '?';
      if (!modifiedUrl.includes('autoplay=')) modifiedUrl += '&autoplay=1';
      if (!modifiedUrl.includes('controls=')) modifiedUrl += '&controls=1';
    }
    
    return modifiedUrl;
  };
  
  return {
    videoRef,
    playerContainerRef,
    loadError,
    setLoadError,
    isContentLoaded,
    loadAttempts,
    handleIframeLoad,
    handleIframeError,
    getModifiedEmbedUrl
  };
};
