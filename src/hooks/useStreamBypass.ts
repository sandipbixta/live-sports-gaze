
import { useState, useEffect, useCallback } from 'react';
import { Stream } from '../types/sports';

export const useStreamBypass = (stream: Stream | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const [useProxyMethod, setUseProxyMethod] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);

  // Enhanced function to create proxy URL to bypass iframe blocking
  const createProxyUrl = useCallback((originalUrl: string) => {
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/'
    ];
    
    return corsProxies[retryCount % corsProxies.length] + encodeURIComponent(originalUrl);
  }, [retryCount]);

  // Method to inject custom headers to bypass X-Frame-Options
  const createBypassIframe = useCallback((url: string) => {
    const bypassHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; }
          iframe { width: 100%; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe 
          src="${url}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowfullscreen
          referrerpolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
        ></iframe>
        <script>
          // Remove X-Frame-Options header if possible
          try {
            delete window.frameElement;
          } catch(e) {}
        </script>
      </body>
      </html>
    `;
    
    return 'data:text/html;base64,' + btoa(bypassHtml);
  }, []);

  // Create the appropriate iframe URL based on bypass method
  const getIframeUrl = useCallback(() => {
    if (!stream?.embedUrl) return '';
    
    try {
      let baseUrl = stream.embedUrl;
      
      // Add cache busting and autoplay parameters
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_retry', retryCount.toString());
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('muted', '0');
      
      // Apply bypass method
      if (useProxyMethod) {
        console.log('Using proxy bypass method');
        return createProxyUrl(url.toString());
      } else if (retryCount > 1) {
        console.log('Using HTML bypass method');
        return createBypassIframe(url.toString());
      } else {
        console.log('Using direct method');
        return url.toString();
      }
    } catch {
      return stream.embedUrl;
    }
  }, [stream, retryCount, useProxyMethod, createProxyUrl, createBypassIframe]);

  // Function to refresh stream URL and try different bypass methods
  const refreshStream = useCallback(() => {
    if (stream?.embedUrl) {
      console.log('Refreshing stream with bypass methods...');
      
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setRetryCount(prev => prev + 1);
      
      // Try different bypass methods based on retry count
      if (retryCount % 3 === 0) {
        console.log('Using direct URL method');
        setUseProxyMethod(false);
      } else if (retryCount % 3 === 1) {
        console.log('Using proxy method');
        setUseProxyMethod(true);
      } else {
        console.log('Using HTML bypass method');
        setUseProxyMethod(false);
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

  // Set timeout for iframe loading
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = 8000;
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          console.log('⏰ Iframe loading timeout - trying bypass method');
          setIframeTimeout(true);
          
          if (retryCount < 3) {
            console.log('Auto-retrying with bypass...');
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
    getIframeUrl
  };
};
