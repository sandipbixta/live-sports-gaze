
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
    console.log('Back button clicked');
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
  
  const openStreamInNewTab = () => {
    if (stream?.embedUrl) {
      console.log('Opening stream in new tab:', stream.embedUrl);
      window.open(stream.embedUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const togglePictureInPicture = () => {
    console.log('Picture-in-picture functionality');
  };

  // Stream initialization
  useEffect(() => {
    if (stream) {
      const startTime = performance.now();
      setLoadStartTime(startTime);
      setLoadError(false);
      setIsContentLoaded(false);
      setIframeTimeout(false);
      setMobileStreamBlocked(false);
      
      console.log(`🎬 Stream Loading Started: ${stream.embedUrl}`);
      console.log(`📱 Mobile device: ${isMobile}`);
      
      const debugInfo = `Stream Debug Info:
        - URL: ${stream.embedUrl}
        - Source: ${stream.source}
        - ID: ${stream.id}
        - Language: ${stream.language || 'Unknown'}
        - HD: ${stream.hd || false}
        - Stream No: ${stream.streamNo || 'N/A'}
        - Mobile: ${isMobile}
        - Retry: ${retryCount}
        - Timestamp: ${new Date().toISOString()}`;
      
      setStreamDebugInfo(debugInfo);
      console.log(debugInfo);
    }
  }, [stream, isMobile, retryCount]);

  // Timeout handler - faster timeout for better UX
  useEffect(() => {
    if (stream && !isContentLoaded && !loadError) {
      const timeoutDuration = isMobile ? 5000 : 8000; // Increased timeout
      
      const timer = setTimeout(() => {
        if (!isContentLoaded) {
          const loadTime = performance.now() - loadStartTime;
          console.log(`⏰ Stream timeout after ${loadTime}ms`);
          setIframeTimeout(true);
          
          if (isMobile) {
            setMobileStreamBlocked(true);
          }
        }
      }, timeoutDuration);

      return () => clearTimeout(timer);
    }
  }, [stream, isContentLoaded, loadError, isMobile, loadStartTime]);

  const handleRetry = () => {
    console.log('🔄 Retrying stream...');
    setLoadError(false);
    setIsContentLoaded(false);
    setIframeTimeout(false);
    setMobileStreamBlocked(false);
    setLoadStartTime(performance.now());
    setRetryCount(prev => prev + 1);
    
    if (onRetry) onRetry();
  };

  const handleIframeLoad = () => {
    const loadTime = performance.now() - loadStartTime;
    console.log(`✅ Stream loaded successfully in ${loadTime}ms`);
    setIsContentLoaded(true);
    setMobileStreamBlocked(false);
    setRetryCount(0);
  };

  const handleIframeError = () => {
    const errorTime = performance.now() - loadStartTime;
    console.error(`❌ Stream failed to load after ${errorTime}ms`);
    setLoadError(true);
    
    if (isMobile) {
      setMobileStreamBlocked(true);
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
