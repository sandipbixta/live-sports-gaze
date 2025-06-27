
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { Stream } from '../types/sports';

export const useFullscreenOrientation = (stream: Stream | null, videoRef: React.RefObject<HTMLIFrameElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastOrientation, setLastOrientation] = useState<number | null>(null);
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
    
    // On mobile, when exiting fullscreen, refresh the iframe to prevent playback issues
    if (!isCurrentlyFullscreen && isMobile && videoRef.current) {
      setTimeout(() => {
        if (videoRef.current && stream?.embedUrl) {
          console.log('Refreshing iframe after fullscreen exit on mobile');
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = currentSrc;
            }
          }, 100);
        }
      }, 200);
    }
  };

  // Handle device orientation changes on mobile
  const handleOrientationChange = () => {
    if (!isMobile || !stream) return;
    
    const currentOrientation = window.orientation || screen.orientation?.angle || 0;
    console.log('Orientation changed from', lastOrientation, 'to', currentOrientation);
    
    // If we're in fullscreen and orientation changed, refresh the iframe
    if (isFullscreen && lastOrientation !== null && lastOrientation !== currentOrientation) {
      console.log('Refreshing iframe due to orientation change in fullscreen');
      setTimeout(() => {
        if (videoRef.current && stream?.embedUrl) {
          const currentSrc = videoRef.current.src;
          videoRef.current.src = '';
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = currentSrc;
            }
          }, 300);
        }
      }, 500);
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
      // Also listen to resize as a fallback
      window.addEventListener('resize', handleOrientationChange);
      
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
    };
  }, [isMobile, isFullscreen, lastOrientation, stream]);

  return { isFullscreen, lastOrientation };
};
