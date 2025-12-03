
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Play } from 'lucide-react';

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
  const [clickCount, setClickCount] = useState(0);
  const [showClickShield, setShowClickShield] = useState(true);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Number of clicks to absorb before allowing through (blocks ad clicks)
  const CLICKS_TO_ABSORB = 3;

  // Handle click shield - absorbs first few clicks
  const handleShieldClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    console.log(`🛡️ Click absorbed (${newCount}/${CLICKS_TO_ABSORB})`);
    
    if (newCount >= CLICKS_TO_ABSORB) {
      setShowClickShield(false);
      console.log('🎬 Click shield removed - player now interactive');
    }
  };

  // Reset click shield when source changes
  useEffect(() => {
    setClickCount(0);
    setShowClickShield(true);
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone"
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
        frameBorder="0"
        scrolling="no"
        style={{ 
          border: 'none',
          pointerEvents: showClickShield ? 'none' : 'auto',
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

      {/* Click absorption shield - blocks ad clicks */}
      {showClickShield && !showOpenOverlay && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer z-10 transition-opacity"
          onClick={handleShieldClick}
        >
          <div className="text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
            <p className="text-lg font-semibold">Click to Play</p>
            <p className="text-sm text-gray-400 mt-1">
              {clickCount > 0 ? `${CLICKS_TO_ABSORB - clickCount} more click${CLICKS_TO_ABSORB - clickCount !== 1 ? 's' : ''} to start` : 'Tap the play button'}
            </p>
          </div>
        </div>
      )}

      {showOpenOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-4 z-20">
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
