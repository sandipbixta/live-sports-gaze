
import { useState, RefObject } from 'react';

export const usePictureInPicture = (iframeRef: RefObject<HTMLIFrameElement>) => {
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  // Toggle picture-in-picture mode
  const togglePictureInPicture = async () => {
    try {
      // For modern browsers with PiP API
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else if (iframeRef.current) {
        // Try to enter PiP mode - this is tricky with iframes but we'll try
        // We need to access the video element inside the iframe
        const iframeDocument = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        const videoElement = iframeDocument?.querySelector('video');
        
        if (videoElement && videoElement.requestPictureInPicture) {
          await videoElement.requestPictureInPicture();
          setIsPictureInPicture(true);
        } else {
          console.error('Picture-in-picture not supported or video element not found in iframe');
        }
      }
    } catch (error) {
      console.error('Failed to toggle picture-in-picture mode:', error);
    }
  };

  return { isPictureInPicture, togglePictureInPicture };
};
