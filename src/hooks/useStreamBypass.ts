
import { useState, useEffect, useCallback } from 'react';
import { Stream } from '../types/sports';

export const useStreamBypass = (stream: Stream | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);

  // Create a stable video URL with minimal cache busting
  const getVideoUrl = useCallback(() => {
    if (!stream?.embedUrl) return '';
    
    try {
      const baseUrl = stream.embedUrl;
      const url = new URL(baseUrl);
      
      // Only add cache busting on retries
      if (retryCount > 0) {
        url.searchParams.set('_retry', retryCount.toString());
      }
      
      return url.toString();
    } catch {
      // Fallback for invalid URLs
      const separator = stream.embedUrl.includes('?') ? '&' : '?';
      return retryCount > 0 ? `${stream.embedUrl}${separator}_retry=${retryCount}` : stream.embedUrl;
    }
  }, [stream, retryCount]);

  // Function to refresh stream URL
  const refreshStream = useCallback(() => {
    if (stream?.embedUrl) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      setUseProxyMethod(retryCount > 0);
    }
  }, [stream, retryCount]);

  // Reset states when stream changes - simplified logic
  useEffect(() => {
    if (stream?.embedUrl) {
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(0);
      setUseProxyMethod(false);
    }
  }, [stream?.embedUrl]);

  // Simplified timeout - reduced from 10s to 5s for faster fallback
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError && retryCount === 0) {
      const timer = setTimeout(() => {
        if (!isContentLoaded && !loadError) {
          setIframeTimeout(true);
        }
      }, 5000); // Faster timeout for better UX

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
