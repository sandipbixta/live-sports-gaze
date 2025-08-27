
import { useState, useEffect, useCallback } from 'react';
import { Stream } from '../types/sports';

export const useStreamBypass = (stream: Stream | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);

  // Create a stable video URL with minimal cache busting to avoid conflicts
  const getVideoUrl = useCallback(() => {
    if (!stream?.embedUrl) return '';
    
    try {
      const baseUrl = stream.embedUrl;
      const url = new URL(baseUrl);
      
      // Reduce cache busting - only on retries to allow better caching
      if (retryCount > 0) {
        url.searchParams.set('_retry', retryCount.toString());
        url.searchParams.set('_t', Math.floor(Date.now() / 30000).toString()); // 30-second cache windows
      }
      
      console.log('🎯 Generated clean video URL:', url.toString());
      return url.toString();
    } catch {
      // Fallback for invalid URLs
      const separator = stream.embedUrl.includes('?') ? '&' : '?';
      return `${stream.embedUrl}${separator}_t=${Date.now()}`;
    }
  }, [stream, retryCount]);

  // Function to refresh stream URL
  const refreshStream = useCallback(() => {
    if (stream?.embedUrl) {
      console.log(`🔄 Refreshing stream (attempt ${retryCount + 1})...`);
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      
      // Only use proxy method after first retry
      setUseProxyMethod(retryCount > 0);
    }
  }, [stream, retryCount]);

  // Reset states when stream changes - simplified logic
  useEffect(() => {
    if (stream?.embedUrl) {
      console.log('🎬 New stream detected, resetting player state...');
      
      // Reset all states for new stream
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(0);
      setUseProxyMethod(false);
    }
  }, [stream?.embedUrl]);

  // Simplified timeout with auto-retry - only for actual loading issues
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError && retryCount === 0) {
      const timer = setTimeout(() => {
        if (!isContentLoaded && !loadError) {
          console.log('⏰ Initial load timeout, will auto-retry if needed...');
          setIframeTimeout(true);
        }
      }, 20000); // 20 seconds - increased timeout for better loading

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
