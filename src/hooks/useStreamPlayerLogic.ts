
import { useRef, useState, useEffect } from 'react';
import { Stream } from '../types/sports';
import { useIsMobile } from './use-mobile';
import { useNavigate } from 'react-router-dom';

interface UseStreamPlayerLogicProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
}

export const useStreamPlayerLogic = ({ stream, isLoading, onRetry }: UseStreamPlayerLogicProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [iframeTimeout, setIframeTimeout] = useState(false);
  const [streamDebugInfo, setStreamDebugInfo] = useState<string>('');
  const [mobileStreamBlocked, setMobileStreamBlocked] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();

  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Back button clicked on mobile:', isMobile);
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/channels');
    }
  };
  
  const openStreamInNewTab = () => {
    if (stream?.embedUrl) {
      if (isMobile) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = stream.embedUrl;
        form.target = '_blank';
        form.style.display = 'none';
        
        const referrerInput = document.createElement('input');
        referrerInput.type = 'hidden';
        referrerInput.name = 'referrer';
        referrerInput.value = 'no-referrer';
        form.appendChild(referrerInput);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        window.open(stream.embedUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };
  
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality moved to fullscreen');
  };

  // Enhanced debugging with performance timing
  useEffect(() => {
    if (stream) {
      const startTime = performance.now();
      setLoadStartTime(startTime);
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setMobileStreamBlocked(false);
      
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      console.log(`🎬 Stream Loading Started at: ${new Date().toISOString()}`);
      console.log(`⏱️ Performance timestamp: ${startTime}`);
      console.log(`🔄 Retry attempt: ${retryCount}`);
      
      const debugInfo = `Stream Performance Debug:
        - Start Time: ${new Date().toISOString()}
        - Retry Count: ${retryCount}
        - Source: ${stream.source}
        - ID: ${stream.id}
        - Stream No: ${stream.streamNo}
        - Language: ${stream.language}
        - HD: ${stream.hd}
        - URL: ${stream.embedUrl}
        - URL Length: ${stream.embedUrl?.length}
        - URL Protocol: ${stream.embedUrl?.startsWith('https') ? 'HTTPS' : 'HTTP'}
        - Current Site Protocol: ${window.location.protocol}
        - Mobile Device: ${isMobile}
        - Mobile User Agent: ${isMobileUserAgent}
        - iOS Device: ${isIOS}
        - Android Device: ${isAndroid}
        - Connection: ${(navigator as any).connection?.effectiveType || 'unknown'}
        - User Agent: ${navigator.userAgent}
        - Viewport: ${window.innerWidth}x${window.innerHeight}`;
      
      console.log(debugInfo);
      setStreamDebugInfo(debugInfo);
      
      // Check for mixed content issues
      if (window.location.protocol === 'https:' && stream.embedUrl?.startsWith('http:')) {
        console.warn('⚠️ Mixed content issue: HTTPS site trying to load HTTP stream');
        if (isMobile) {
          setMobileStreamBlocked(true);
        }
      }
      
      // Preload DNS and connection for the stream domain
      if (stream.embedUrl) {
        try {
          const url = new URL(stream.embedUrl);
          const domain = url.hostname;
          
          // Check if DNS prefetch already exists
          if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
            const prefetch = document.createElement('link');
            prefetch.rel = 'dns-prefetch';
            prefetch.href = `//${domain}`;
            document.head.appendChild(prefetch);
            console.log(`🌐 DNS prefetch added for: ${domain}`);
          }
          
          // Check if preconnect already exists
          if (!document.querySelector(`link[rel="preconnect"][href="${url.origin}"]`)) {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = url.origin;
            preconnect.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect);
            console.log(`🔗 Preconnect added for: ${url.origin}`);
          }
        } catch (error) {
          console.warn('Failed to preload stream domain:', error);
        }
      }
    }
  }, [stream, isMobile, retryCount]);

  // Faster timeout with retry logic
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = isMobile ? 2000 : 4000;
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          const loadTime = performance.now() - loadStartTime;
          console.log(`⏰ Stream timeout after ${loadTime}ms - likely blocked or slow connection`);
          setIframeTimeout(true);
          
          if (isMobile) {
            setMobileStreamBlocked(true);
          }
          
          // Auto-retry once after timeout
          if (retryCount < 1) {
            console.log('🔄 Auto-retrying after timeout...');
            setTimeout(() => {
              handleRetry();
            }, 1000);
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile, loadStartTime, retryCount]);

  const handleRetry = () => {
    const retryTime = performance.now();
    console.log(`🔄 Retrying stream at ${new Date().toISOString()}`);
    console.log(`🔄 Retry performance timestamp: ${retryTime}`);
    
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    setMobileStreamBlocked(false);
    setLoadStartTime(retryTime);
    setRetryCount(prev => prev + 1);
    
    if (onRetry) onRetry();
  };

  const handleIframeLoad = () => {
    const loadTime = performance.now() - loadStartTime;
    console.log(`✅ Stream loaded successfully in ${loadTime}ms on ${isMobile ? 'mobile' : 'desktop'}`);
    console.log(`✅ Load completed at: ${new Date().toISOString()}`);
    setIsContentLoaded(true);
    setMobileStreamBlocked(false);
    setRetryCount(0); // Reset retry count on success
  };

  const handleIframeError = () => {
    const errorTime = performance.now() - loadStartTime;
    console.error(`❌ Stream failed to load after ${errorTime}ms on ${isMobile ? 'mobile' : 'desktop'}`);
    console.error(`❌ Error occurred at: ${new Date().toISOString()}`);
    setLoadError(true);
    
    if (isMobile) {
      setMobileStreamBlocked(true);
    }
    
    // Auto-retry on error if haven't retried too many times
    if (retryCount < 2) {
      console.log('🔄 Auto-retrying after error...');
      setTimeout(() => {
        handleRetry();
      }, 2000);
    }
  };

  return {
    videoRef,
    loadError,
    isContentLoaded,
    iframeTimeout,
    streamDebugInfo,
    mobileStreamBlocked,
    retryCount,
    isMobile,
    handleGoBack,
    openStreamInNewTab,
    togglePictureInPicture,
    handleRetry,
    handleIframeLoad,
    handleIframeError
  };
};
