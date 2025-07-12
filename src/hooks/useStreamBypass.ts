
import { useState, useEffect, useCallback } from 'react';
import { Stream } from '../types/sports';

export const useStreamBypass = (stream: Stream | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);

  // Create the appropriate video URL based on bypass method
  const getVideoUrl = useCallback(() => {
    if (!stream?.embedUrl) return '';
    
    try {
      let baseUrl = stream.embedUrl;
      
      // Add stronger cache busting parameters to force reload
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_refresh', Math.random().toString(36).substring(7));
      url.searchParams.set('_nocache', '1');
      
      // Add session ID to ensure uniqueness across page loads
      url.searchParams.set('_session', `${Date.now()}_${Math.random()}`);
      
      // Only add retry parameter if we're actually retrying
      if (retryCount > 0) {
        url.searchParams.set('_retry', retryCount.toString());
      }
      
      console.log('Generated video URL:', url.toString());
      return url.toString();
    } catch {
      // If URL parsing fails, add simple cache busting
      const separator = stream.embedUrl.includes('?') ? '&' : '?';
      const cacheBuster = `_t=${Date.now()}&_refresh=${Math.random().toString(36).substring(7)}&_nocache=1&_session=${Date.now()}_${Math.random()}`;
      return `${stream.embedUrl}${separator}${cacheBuster}`;
    }
  }, [stream, retryCount]);

  // Function to refresh stream URL and try different bypass methods
  const refreshStream = useCallback(() => {
    if (stream?.embedUrl) {
      console.log(`🔄 Refreshing video stream (attempt ${retryCount + 1})...`);
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      
      // Alternate between direct and proxy methods
      setUseProxyMethod(retryCount % 2 === 1);
    }
  }, [stream, retryCount]);

  // Reset states when stream changes or on initial load
  useEffect(() => {
    if (stream?.embedUrl) {
      console.log('🎬 Stream detected, initializing player...');
      
      // Always reset everything on stream change (including page reload)
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(0);
      setUseProxyMethod(false);
      
      // Force immediate refresh to ensure stream loads
      setTimeout(() => {
        console.log('✅ Stream player ready for:', stream.embedUrl?.substring(0, 50) + '...');
        // Trigger a refresh to ensure the stream loads properly
        setRetryCount(1);
        setRetryCount(0);
      }, 100);
    }
  }, [stream?.embedUrl]);

  // Set timeout for loading with auto-retry
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = 10000; // 10 seconds timeout
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Stream loading timeout, forcing refresh...');
          setIframeTimeout(true);
          // Force refresh on timeout
          refreshStream();
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, refreshStream]);

  return {
    retryCount,
    useProxyMethod,
    loadError,
    isContentLoaded,
    iframeTimeout,
    setLoadError,
    setIsContentLoaded,
    setIframeTimeout,
    refreshStream,
    getVideoUrl
  };
};
