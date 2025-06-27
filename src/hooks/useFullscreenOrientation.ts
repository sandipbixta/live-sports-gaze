
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { Stream } from '../types/sports';

export const useFullscreenOrientation = (stream: Stream | null, videoRef: React.RefObject<HTMLIFrameElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrientation, setLastOrientation] = useState<number | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  // Enhanced mobile fullscreen handling
  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    
    setIsFullscreen(isCurrentlyFullscreen);
    console.log('Fullscreen state changed:', isCurrentlyFullscreen);
    
    // Clear any pending refresh timeout when entering fullscreen
    if (isCurrentlyFullscreen && refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
    
    // Only refresh iframe on mobile when exiting fullscreen, with a delay to prevent conflicts
    if (!isCurrentlyFullscreen && isMobile && videoRef.current && stream?.embedUrl) {
      const timeout = setTimeout(() => {
        if (videoRef.current && stream?.embedUrl && !document.fullscreenElement) {
          console.log('Refreshing iframe after fullscreen exit on mobile');
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = currentSrc;
            }
          }, 100);
        }
      }, 500); // Increased delay to prevent conflicts
      
      setRefreshTimeout(timeout);
    }
  };

  // Handle device orientation changes on mobile - only refresh if not in fullscreen
  const handleOrientationChange = () => {
    if (!isMobile || !stream) return;
    
    const currentOrientation = window.orientation || screen.orientation?.angle || 0;
    console.log('Orientation changed from', lastOrientation, 'to', currentOrientation);
    
    // Only refresh if we're NOT in fullscreen and orientation actually changed
    if (!isFullscreen && lastOrientation !== null && lastOrientation !== currentOrientation) {
      console.log('Refreshing iframe due to orientation change (not in fullscreen)');
      
      // Clear any existing timeout
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      const timeout = setTimeout(() => {
        if (videoRef.current && stream?.embedUrl && !document.fullscreenElement) {
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = currentSrc;
            }
          }, 300);
        }
      }, 800); // Longer delay to prevent interference
      
      setRefreshTimeout(timeout);
    }
    
    setLastOrientation(currentOrientation);
  };

  // Add event listeners for fullscreen and orientation changes
  useEffect(() => {
    // Fullscreen change listeners
    const fullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'msfullscreenchange'
    ];
    
    fullscreenEvents.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    // Orientation change listener for mobile
    if (isMobile) {
      window.addEventListener('orientationchange', handleOrientationChange);
      // Also listen to resize as a fallback, but with throttling
      let resizeTimeout: NodeJS.Timeout;
      const throttledResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleOrientationChange, 300);
      };
      window.addEventListener('resize', throttledResize);
      
      // Set initial orientation
      setLastOrientation(window.orientation || screen.orientation?.angle || 0);
    }

    return () => {
      fullscreenEvents.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
      
      if (isMobile) {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      }
      
      // Clear any pending timeouts
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [isMobile, isFullscreen, lastOrientation, stream, refreshTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshTimeout]);

  return { isFullscreen, lastOrientation };
};
