
import React, { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Maximize } from 'lucide-react';
import { Button } from '../ui/button';

interface IframeVideoPlayerProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  title?: string;
}

const IframeVideoPlayer: React.FC<IframeVideoPlayerProps> = ({ src, onLoad, onError, title }) => {
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showControls, setShowControls] = useState(true);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  // Handle iframe clicks on mobile to prevent automatic opening
  const handleIframeClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      console.log('Mobile iframe click prevented');
    }
  };

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
    };

    const container = iframeRef.current?.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timer);
      };
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <iframe 
        ref={iframeRef}
        src={src}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        title={title || "Live Stream"}
        onLoad={onLoad}
        onError={onError}
        onClick={handleIframeClick}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-top-navigation"
        referrerPolicy="no-referrer"
        loading="eager"
        style={{ 
          border: 'none',
          pointerEvents: isMobile ? 'auto' : 'auto',
          ...(isMobile && {
            touchAction: 'manipulation',
            WebkitOverflowScrolling: 'touch',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          })
        }}
      />

      {/* Fullscreen Control Overlay */}
      <div 
        className={`absolute top-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IframeVideoPlayer;
