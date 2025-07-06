
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { Stream } from '../types/sports';

export const useFullscreenOrientation = (stream: Stream | null, videoRef: React.RefObject<HTMLIFrameElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrientation, setLastOrientation] = useState<number | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);
  const [orientationChangeInProgress, setOrientationChangeInProgress] = useState(false);
  const isMobile = useIsMobile();

  // Enhanced fullscreen detection for mobile
  const checkFullscreenState = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      // Additional mobile fullscreen checks
      (window.screen && (window.screen as any).orientation && (window.screen as any).orientation.type && window.innerHeight === window.screen.height) ||
      (window.visualViewport && window.visualViewport.height === window.screen.height)
    );
    
    return isCurrentlyFullscreen;
  };

  // Enhanced mobile fullscreen handling
  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = checkFullscreenState();
    
    setIsFullscreen(isCurrentlyFullscreen);
    console.log('Fullscreen state changed:', isCurrentlyFullscreen);
    
    // Clear any pending refresh timeout when entering fullscreen
    if (isCurrentlyFullscreen && refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
    
    // Only refresh iframe on mobile when exiting fullscreen, with a delay to prevent conflicts
    if (!isCurrentlyFullscreen && isMobile && videoRef.current && stream?.embedUrl && !orientationChangeInProgress) {
      const timeout = setTimeout(() => {
        // Triple check we're not in any fullscreen state
        if (videoRef.current && stream?.embedUrl && !checkFullscreenState() && !orientationChangeInProgress) {
          console.log('Refreshing iframe after fullscreen exit on mobile');
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current && !checkFullscreenState()) {
              videoRef.current.src = currentSrc;
            }
          }, 100);
        }
      }, 1000); // Increased delay to prevent conflicts
      
      setRefreshTimeout(timeout);
    }
  };

  // Handle device orientation changes on mobile - COMPLETELY DISABLE refresh during fullscreen
  const handleOrientationChange = () => {
    if (!isMobile || !stream) return;
    
    const currentOrientation = window.orientation || screen.orientation?.angle || 0;
    const currentlyInFullscreen = checkFullscreenState();
    
    console.log('Orientation changed from', lastOrientation, 'to', currentOrientation, 'Fullscreen:', currentlyInFullscreen);
    
    // Set orientation change flag
    setOrientationChangeInProgress(true);
    
    // CRITICAL: NEVER refresh iframe during orientation change if in fullscreen
    if (!currentlyInFullscreen && lastOrientation !== null && lastOrientation !== currentOrientation) {
      console.log('Refreshing iframe due to orientation change (not in fullscreen)');
      
      // Clear any existing timeout
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      const timeout = setTimeout(() => {
        // Final check - ensure we're still not in fullscreen and orientation change is complete
        const stillInFullscreen = checkFullscreenState();
        
        if (videoRef.current && stream?.embedUrl && !stillInFullscreen) {
          console.log('Executing iframe refresh after orientation change');
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current && !checkFullscreenState()) {
              videoRef.current.src = currentSrc;
            }
          }, 300);
        }
        
        // Clear orientation change flag
        setTimeout(() => setOrientationChangeInProgress(false), 1000);
      }, 1200); // Even longer delay to prevent interference
      
      setRefreshTimeout(timeout);
    } else {
      console.log('Skipping iframe refresh - in fullscreen mode or no orientation change');
      // Clear orientation change flag even if we don't refresh
      setTimeout(() => setOrientationChangeInProgress(false), 1000);
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

    // Orientation change listener for mobile with enhanced handling
    if (isMobile) {
      // Use both orientationchange and resize with debouncing
      let orientationTimeout: NodeJS.Timeout;
      const debouncedOrientationChange = () => {
        clearTimeout(orientationTimeout);
        orientationTimeout = setTimeout(handleOrientationChange, 500);
      };
      
      window.addEventListener('orientationchange', debouncedOrientationChange);
      
      // Also listen to resize as a fallback, but with more throttling
      let resizeTimeout: NodeJS.Timeout;
      const throttledResize = () => {
        if (!orientationChangeInProgress) {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(handleOrientationChange, 800);
        }
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
  }, [isMobile, isFullscreen, lastOrientation, stream, refreshTimeout, orientationChangeInProgress]);

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
