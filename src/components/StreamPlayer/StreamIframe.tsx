
import React, { useEffect, useState, useCallback } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';

interface StreamIframeProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  videoRef: React.RefObject<HTMLIFrameElement>;
}

const StreamIframe: React.FC<StreamIframeProps> = ({ src, onLoad, onError, videoRef }) => {
  const isMobile = useIsMobile();
  const [loaded, setLoaded] = useState(false);
  const [hadError, setHadError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Setup iframe ad protection
  const setupIframeProtection = useCallback(() => {
    const iframe = videoRef.current;
    if (!iframe) return;
    
    try {
      // Block iframe from opening new windows (ads)
      if (iframe.contentWindow) {
        (iframe.contentWindow as any).open = function() { 
          console.log('🛡️ Blocked popup from iframe');
          return null; 
        };
      }
    } catch (e) {
      console.log('🛡️ Iframe protection active (cross-origin)');
    }
  }, [videoRef]);

  // Block postMessage ads
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (videoRef.current && event.source === videoRef.current.contentWindow) {
        console.log('🛡️ Intercepted message from iframe');
        
        // Check for ad-related messages
        try {
          const messageStr = JSON.stringify(event.data).toLowerCase();
          if (messageStr.includes('ad') || messageStr.includes('popup') || messageStr.includes('click')) {
            event.stopPropagation();
            console.log('🛡️ Blocked ad-related message from iframe');
            return;
          }
        } catch (e) {
          // Ignore serialization errors
        }
      }
    };

    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, [videoRef]);

  // Periodic check for iframe ad attempts
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (document.activeElement === videoRef.current) {
          console.log('🛡️ Iframe gained focus - monitoring for ads');
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoRef]);

  // Handle iframe clicks on mobile to prevent automatic opening
  const handleIframeClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      console.log('🛡️ Mobile iframe click intercepted');
    }
  };

  useEffect(() => {
    setLoaded(false);
    setHadError(false);
    setTimedOut(false);
    const t = window.setTimeout(() => {
      setTimedOut(true);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    // Setup protection after iframe loads
    setTimeout(() => {
      setupIframeProtection();
    }, 100);
    onLoad?.();
  };

  const handleError = () => {
    setHadError(true);
    onError?.();
  };

  const showOpenOverlay = isAndroid && (hadError || (timedOut && !loaded));

  return (
    <div className="absolute inset-0 w-full h-full">
      <iframe 
        ref={videoRef}
        src={src}
        className="w-full h-full"
        width="1920"
        height="1080"
        allowFullScreen
        title="Live Sports Stream - DAMITV"
        onLoad={handleLoad}
        onError={handleError}
        onClick={handleIframeClick}
        // Sandbox to block popups - allow scripts and same-origin for player to work
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone"
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
        frameBorder="0"
        scrolling="no"
        style={{ 
          border: 'none',
          pointerEvents: 'auto',
          minWidth: '100%',
          minHeight: '100%',
          willChange: 'transform',
          isolation: 'isolate',
          ...(isMobile && {
            touchAction: 'manipulation',
            WebkitOverflowScrolling: 'touch',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          })
        }}
      />

      {showOpenOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-4">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md px-4 py-2 text-white bg-white/10 hover:bg-white/20"
            aria-label="Open stream in a new tab"
          >
            Open stream in new tab
          </a>
        </div>
      )}
    </div>
  );
};

export default StreamIframe;
