
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
      console.log('Stream player received stream:', stream);
      console.log('Stream embed URL:', stream.embedUrl);
      
      // Check if stream has an error flag
      if (stream.error) {
        console.error('Stream has error flag set');
        setLoadError(true);
      }
    }
  }, [stream]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
    setLoadError(false);
    
    // Check if iframe is actually working after a brief delay
    setTimeout(() => {
      const iframe = videoRef.current;
      if (iframe) {
        try {
          // Try to access iframe to see if it's working
          const iframeWindow = iframe.contentWindow;
          if (!iframeWindow) {
            console.warn('Iframe content window not available - possible CORS issue');
            // Don't set error here as some valid streams still work even with CORS restrictions
          }
        } catch (error) {
          console.error('Error accessing iframe content:', error);
          // Don't set error here as the stream might still be working despite the error
        }
      }
    }, 2000); // Increased timeout to give iframe more time to load
  };
  
  // Handle iframe error
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Stream iframe failed to load:', e);
    setLoadError(true);
    setIsContentLoaded(false);
  };
  
  // Modify iframe URL to ensure cross-browser compatibility
  const getModifiedEmbedUrl = (url: string) => {
    if (!url) return '';
    
    console.log('Modifying embed URL:', url);
    
    // Fix common URL issues
    let modifiedUrl = url
      .replace(/&amp;/g, '&')  // Fix encoded ampersands
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace
      
    // Ensure URL has proper protocol
    if (!modifiedUrl.startsWith('http')) {
      modifiedUrl = modifiedUrl.startsWith('//') ? `https:${modifiedUrl}` : `https://${modifiedUrl}`;
    }
    
    // Handle YouTube URLs for better compatibility
    if (modifiedUrl.includes('youtube.com') || modifiedUrl.includes('youtu.be')) {
      if (!modifiedUrl.includes('?')) modifiedUrl += '?';
      if (!modifiedUrl.includes('autoplay=')) modifiedUrl += '&autoplay=1';
      if (!modifiedUrl.includes('controls=')) modifiedUrl += '&controls=1';
      if (!modifiedUrl.includes('origin=')) {
        modifiedUrl += `&origin=${encodeURIComponent(window.location.origin)}`;
      }
    }
    
    // Add any required parameters for other providers
    if (modifiedUrl.includes('player.') || modifiedUrl.includes('/embed/')) {
      if (!modifiedUrl.includes('autoplay=')) {
        modifiedUrl = modifiedUrl.includes('?') ? 
          `${modifiedUrl}&autoplay=1` : 
          `${modifiedUrl}?autoplay=1`;
      }
      
      // Referrer policy might help with some providers
      if (!modifiedUrl.includes('referrerpolicy=')) {
        modifiedUrl += '&referrerpolicy=origin';
      }
    }
    
    console.log('Modified URL:', modifiedUrl);
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
