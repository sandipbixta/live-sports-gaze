import { useState, useEffect, useCallback } from 'react';
import { Stream } from '../types/sports';

export const useStreamBypass = (stream: Stream | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);

  // Enhanced function to create proxy URL for video streams
  const createProxyUrl = useCallback((originalUrl: string) => {
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];
    
    return corsProxies[retryCount % corsProxies.length] + encodeURIComponent(originalUrl);
  }, [retryCount]);

  // Method to extract direct video URL from embed URL
  const extractVideoUrl = useCallback((embedUrl: string) => {
    try {
      // Handle different embed URL patterns
      if (embedUrl.includes('/embed/')) {
        // Try to extract direct stream URL from embed URL
        const urlParts = embedUrl.split('/embed/');
        if (urlParts.length > 1) {
          const streamId = urlParts[1].split('?')[0];
          // Try common direct stream URL patterns
          const baseUrl = urlParts[0];
          return `${baseUrl}/stream/${streamId}.m3u8`;
        }
      }
      
      // If embed URL contains direct video file extensions
      if (embedUrl.match(/\.(m3u8|mp4|webm|ogg)(\?|$)/i)) {
        return embedUrl;
      }
      
      // Otherwise return the embed URL as fallback
      return embedUrl;
    } catch {
      return embedUrl;
    }
  }, []);

  // Create the appropriate video URL based on bypass method
  const getVideoUrl = useCallback(() => {
    if (!stream?.embedUrl) return '';
    
    try {
      let baseUrl = stream.embedUrl;
      
      // First try to extract direct video URL
      baseUrl = extractVideoUrl(baseUrl);
      
      // Add cache busting and streaming parameters
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_retry', retryCount.toString());
      
      // Apply bypass method
      if (useProxyMethod && retryCount > 0) {
        console.log('Using proxy bypass method for video');
        return createProxyUrl(url.toString());
      } else {
        console.log('Using direct video URL');
        return url.toString();
      }
    } catch {
      return stream.embedUrl;
    }
  }, [stream, retryCount, useProxyMethod, createProxyUrl, extractVideoUrl]);

  // Function to refresh stream URL and try different bypass methods
  const refreshStream = useCallback(() => {
    if (stream?.embedUrl) {
      console.log('Refreshing video stream...');
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      
      // Try different methods based on retry count
      if (retryCount % 2 === 0) {
        console.log('Using direct video URL method');
        setUseProxyMethod(false);
      } else {
        console.log('Using proxy method for video');
        setUseProxyMethod(true);
      }
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
  }, [stream]);

  // Set timeout for video loading
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = 10000; // 10 seconds for video
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Video loading timeout - trying alternative method');
          setIframeTimeout(true);
          
          if (retryCount < 2) {
            console.log('Auto-retrying video with different method...');
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
