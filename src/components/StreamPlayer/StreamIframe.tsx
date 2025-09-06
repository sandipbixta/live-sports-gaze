
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Play, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

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
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [userStarted, setUserStarted] = useState(false);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Handle iframe clicks on mobile to prevent automatic opening
  const handleIframeClick = (e: React.MouseEvent) => {
    if (isMobile) {
      // Prevent default behavior that might cause automatic opening
      e.preventDefault();
      console.log('Mobile iframe click prevented');
    }
  };

  useEffect(() => {
    setLoaded(false);
    setHadError(false);
    setTimedOut(false);
    setShowPlayButton(true);
    setUserStarted(false);
    const t = window.setTimeout(() => {
      setTimedOut(true);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
    // Hide play button after a short delay once loaded
    setTimeout(() => {
      if (userStarted) {
        setShowPlayButton(false);
      }
    }, 1500);
  };

  const handlePlayClick = () => {
    setUserStarted(true);
    setShowPlayButton(false);
    console.log('🎬 User clicked play button for iframe stream');
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone"
        referrerPolicy="no-referrer-when-downgrade"
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

      {/* Play Button Overlay */}
      {showPlayButton && !hadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Button
            onClick={handlePlayClick}
            className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 rounded-full p-6 backdrop-blur-sm transition-all duration-300 group"
            size="lg"
          >
            <Play className="w-8 h-8 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
          </Button>
        </div>
      )}

      {showOpenOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-4 z-30">
          <div className="text-center space-y-4">
            <p className="text-white mb-4">Stream failed to load</p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              aria-label="Open stream in a new tab"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open stream in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamIframe;
