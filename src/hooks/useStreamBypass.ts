
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
      
      // Add cache busting parameters
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      
      // Only add retry parameter if we're actually retrying
      if (retryCount > 0) {
        url.searchParams.set('_retry', retryCount.toString());
      }
      
      return url.toString();
    } catch {
      // If URL parsing fails, return original
      return stream.embedUrl;
    }
  }, [stream, retryCount]);

  // Function to refresh stream URL and try different bypass methods
  const refreshStream = useCallback(() => {
    if (stream?.embedUrl) {
      console.log(`Refreshing video stream (attempt ${retryCount + 1})...`);
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      
      // Alternate between direct and proxy methods
      setUseProxyMethod(retryCount % 2 === 1);
    }
  }, [stream, retryCount]);

  // Reset states when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(0);
      setUseProxyMethod(false);
    }
  }, [stream?.embedUrl]); // Only reset when the actual URL changes

  // Set timeout for loading with reasonable duration
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = 15000; // 15 seconds
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Stream loading timeout');
          setIframeTimeout(true);
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, retryCount]);

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
