
import { useState, useEffect, useRef, RefObject } from 'react';

export const useFullscreen = (targetRef: RefObject<HTMLDivElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update fullscreen state when changed outside our component
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement || 
        !!(document as any).mozFullScreenElement || 
        !!(document as any).msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Enhanced fullscreen handling with better cross-browser support
  const toggleFullscreen = () => {
    try {
      if (!targetRef.current) return;
      
      if (!document.fullscreenElement && 
          !(document as any).webkitFullscreenElement && 
          !(document as any).mozFullScreenElement && 
          !(document as any).msFullscreenElement) {
        // Enter fullscreen with cross-browser support
        if (targetRef.current.requestFullscreen) {
          targetRef.current.requestFullscreen();
        } else if ((targetRef.current as any).webkitRequestFullscreen) { // Safari
          (targetRef.current as any).webkitRequestFullscreen();
        } else if ((targetRef.current as any).mozRequestFullScreen) { // Firefox
          (targetRef.current as any).mozRequestFullScreen();
        } else if ((targetRef.current as any).msRequestFullscreen) { // IE11
          (targetRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen with cross-browser support
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) { // Safari
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) { // Firefox
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) { // IE11
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen mode:', error);
    }
  };

  return { isFullscreen, toggleFullscreen };
};
