
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
  const [userInteracted, setUserInteracted] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Handle iframe clicks on mobile - allow interaction with video controls
  const handleIframeClick = (e: React.MouseEvent) => {
    if (isMobile && !userInteracted) {
      setUserInteracted(true);
      setShowPlayButton(false);
    }
    console.log('Iframe clicked, allowing normal interaction');
  };

  // Handle mobile play button click
  const handlePlayClick = () => {
    setUserInteracted(true);
    setShowPlayButton(false);
    // Try to trigger autoplay by clicking the iframe
    if (videoRef.current) {
      const iframe = videoRef.current;
      iframe.focus();
      // Simulate user interaction with the iframe
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      iframe.dispatchEvent(clickEvent);
    }
  };

  // Show play button for mobile devices after iframe loads
  useEffect(() => {
    if (isMobile && loaded && !userInteracted && !hadError) {
      const timer = setTimeout(() => {
        setShowPlayButton(true);
      }, 1000); // Show play button after 1 second
      return () => clearTimeout(timer);
    }
  }, [isMobile, loaded, userInteracted, hadError]);

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
          willChange: 'transform'
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

      {/* Mobile play button overlay */}
      {isMobile && showPlayButton && !showOpenOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            onClick={handlePlayClick}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
            size="lg"
          >
            <Play className="w-8 h-8 mr-2" />
            Tap to Play
          </Button>
        </div>
      )}

      {/* Mobile external link fallback */}
      {isMobile && userInteracted && !showPlayButton && (
        <div className="absolute bottom-4 right-4">
          <Button asChild className="bg-black/50 hover:bg-black/70 text-white border-0" size="sm">
            <a href={src} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default StreamIframe;
