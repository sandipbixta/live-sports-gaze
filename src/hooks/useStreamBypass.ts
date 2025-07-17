
import { useState, useEffect, useCallback } from 'react';
import { Stream } from '../types/sports';

export const useStreamBypass = (stream: Stream | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);
  const maxRetries = 2; // Limit retries to prevent infinite loops

  // Create a stable video URL with minimal cache busting
  const getVideoUrl = useCallback(() => {
    if (!stream?.embedUrl) return '';
    
    try {
      const baseUrl = stream.embedUrl;
      const url = new URL(baseUrl);
      
      // Add timestamp for cache busting
      url.searchParams.set('_t', Date.now().toString());
      
      // Add retry parameter only if actually retrying
      if (retryCount > 0) {
        url.searchParams.set('_retry', retryCount.toString());
      }
      
      console.log('🎯 Generated video URL:', url.toString());
      return url.toString();
    } catch {
      // Fallback for invalid URLs
      const separator = stream.embedUrl.includes('?') ? '&' : '?';
      return `${stream.embedUrl}${separator}_t=${Date.now()}`;
    }
  }, [stream, retryCount]);

  // Function to refresh stream URL with retry limits
  const refreshStream = useCallback(() => {
    if (!stream?.embedUrl || retryCount >= maxRetries) {
      console.log('🛑 Max retries reached or no stream URL, stopping refresh');
      setLoadError(true);
      return;
    }
    
    console.log(`🔄 Refreshing stream (attempt ${retryCount + 1}/${maxRetries + 1})...`);
    
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    setRetryCount(prev => prev + 1);
    
    // Use proxy method after first retry
    setUseProxyMethod(retryCount > 0);
  }, [stream, retryCount, maxRetries]);

  // Reset states when stream changes
  useEffect(() => {
    if (stream?.embedUrl) {
      console.log('🎬 New stream detected, resetting player state...');
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(0);
      setUseProxyMethod(false);
    }
  }, [stream?.embedUrl]);

  // Timeout handling - only for initial load
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError && retryCount === 0) {
      const timer = setTimeout(() => {
        if (!isContentLoaded && !loadError) {
          console.log('⏰ Initial load timeout detected');
          setIframeTimeout(true);
        }
      }, 15000); // 15 seconds - reasonable timeout for PC

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, retryCount]);

  return {
    retryCount,
    useProxyMethod,
    loadError,
    isContentLoaded,
    iframeTimeout,
    maxRetries,
    setLoadError,
    setIsContentLoaded,
    setIframeTimeout,
    refreshStream,
    getVideoUrl
  };
};
