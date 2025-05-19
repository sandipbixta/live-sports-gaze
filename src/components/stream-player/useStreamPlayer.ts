
import { useState, useEffect, useRef } from 'react';
import { Stream } from '../../types/sports';
import { useToast } from '../../hooks/use-toast';

export const useStreamPlayer = (stream: Stream | null, isLoading: boolean) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Reset states when stream changes
  useEffect(() => {
    if (stream) {
      setLoadError(false);
      setIsContentLoaded(false);
      
      // Log stream info for debugging
      console.log('Stream player received stream:', stream);
      console.log('Stream embed URL:', stream.embedUrl);
      
      // Check if stream has an error flag
      if (stream.error) {
        console.error('Stream has error flag set');
        setLoadError(true);
        toast({
          title: "Stream Issues",
          description: "This stream source may not be working. Try another source.",
          variant: "destructive",
        });
      }
      
      // Set a timeout to detect loading problems
      const timeout = setTimeout(() => {
        if (!isContentLoaded) {
          console.warn('Stream loading timeout');
          // Don't set error immediately, just show a warning toast
          toast({
            title: "Stream Loading Slowly",
            description: "The stream is taking longer than expected to load. It may still work in a moment.",
          });
        }
      }, 10000); // 10 second timeout
      
      setLoadTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [stream, toast]);

  // Clear timeout when content is loaded
  useEffect(() => {
    if (isContentLoaded && loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
  }, [isContentLoaded, loadTimeout]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('Stream iframe loaded successfully');
    setIsContentLoaded(true);
    setLoadError(false);
    
    // If load timeout is still active, clear it
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    
    toast({
      title: "Stream Loaded",
      description: "Enjoy the stream!",
    });
  };
  
  // Handle iframe error
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Stream iframe failed to load:', e);
    setLoadError(true);
    setIsContentLoaded(false);
    
    // If load timeout is still active, clear it
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    
    toast({
      title: "Stream Error",
      description: "This stream failed to load. Try another source.",
      variant: "destructive",
    });
  };
  
  return {
    videoRef,
    playerContainerRef,
    loadError,
    setLoadError,
    isContentLoaded,
    handleIframeLoad,
    handleIframeError
  };
};
