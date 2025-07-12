
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
      
      // Add cache busting parameters to force reload
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_refresh', '1'); // Force refresh parameter
      
      // Only add retry parameter if we're actually retrying
      if (retryCount > 0) {
        url.searchParams.set('_retry', retryCount.toString());
      }
      
      return url.toString();
    } catch {
      // If URL parsing fails, add simple cache busting
      const separator = stream.embedUrl.includes('?') ? '&' : '?';
      return `${stream.embedUrl}${separator}_t=${Date.now()}&_refresh=1`;
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
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(0);
      setUseProxyMethod(false);
      
      // Force a small delay to ensure DOM is ready
      setTimeout(() => {
        console.log('✅ Stream player ready for:', stream.embedUrl?.substring(0, 50) + '...');
      }, 100);
    }
  }, [stream?.embedUrl]);

  // Set timeout for loading with reasonable duration
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = 12000; // Reduced to 12 seconds for faster feedback
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Stream loading timeout, trying to refresh...');
          setIframeTimeout(true);
          // Auto-retry once on timeout
          if (retryCount === 0) {
            refreshStream();
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, retryCount, refreshStream]);

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
