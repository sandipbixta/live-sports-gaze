import React, { useEffect, useState, useRef } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { useIframeProtection } from '../../hooks/useIframeProtection';

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
  const [showAdBlocked, setShowAdBlocked] = useState(false);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Use iframe protection hook
  useIframeProtection(videoRef);

  // Handle iframe clicks on mobile to prevent automatic opening
  const handleIframeClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      console.log('Mobile iframe click prevented');
    }
  };

  useEffect(() => {
    setLoaded(false);
    setHadError(false);
    setTimedOut(false);
    setShowAdBlocked(false);
    const t = window.setTimeout(() => {
      setTimedOut(true);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
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
        sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
        allow="accelerometer; autoplay; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        loading="eager"
        frameBorder="0"
        scrolling="no"
        style={{ 
          border: 'none',
          pointerEvents: isMobile ? 'auto' : 'auto',
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

      {/* Ad Blocked Overlay */}
      {showAdBlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50">
          <div className="text-5xl mb-5">🛡️</div>
          <div className="text-2xl font-bold text-white mb-2">Ad Blocked</div>
          <div className="text-base text-white/80 mb-8 text-center max-w-xs">
            Safe Mode prevented unwanted content
          </div>
          <button 
            onClick={() => setShowAdBlocked(false)}
            className="px-8 py-3 bg-primary text-white border-none rounded-lg text-base font-bold cursor-pointer hover:bg-primary/90"
          >
            Continue Watching
          </button>
        </div>
      )}

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
