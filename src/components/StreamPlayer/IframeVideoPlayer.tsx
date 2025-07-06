
import React, { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Maximize, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface IframeVideoPlayerProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  title?: string;
}

const IframeVideoPlayer: React.FC<IframeVideoPlayerProps> = ({ src, onLoad, onError, title }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Handle home navigation
  const handleHomeClick = () => {
    console.log('DAMITV home button clicked from iframe player');
    navigate('/');
  };

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

  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log('✅ Iframe loaded successfully');
    setHasLoaded(true);
    onLoad();
  };

  // Handle iframe load error
  const handleIframeError = () => {
    console.error('❌ Iframe failed to load');
    onError();
  };

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    const handleMouseMove = () => {
      setShowControls(true);
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
  }, [showControls]);

  // Set a reasonable timeout for iframe loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasLoaded) {
        console.log('Iframe taking too long to load, calling onLoad anyway');
        onLoad();
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [hasLoaded, onLoad]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <iframe 
        ref={iframeRef}
        src={src}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        title={title || "Live Stream"}
        onLoad={() => {
          console.log('✅ Iframe loaded successfully');
          setHasLoaded(true);
          onLoad();
        }}
        onError={() => {
          console.error('❌ Iframe failed to load');
          onError();
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-top-navigation allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer"
        loading="eager"
        style={{ 
          border: 'none',
          pointerEvents: 'auto'
        }}
      />

      {/* Control Overlay */}
      <div 
        className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        <div className="flex items-center justify-between">
          {/* DAMITV Home Button */}
          <Button
            variant="ghost"
            onClick={handleHomeClick}
            className="bg-black/50 hover:bg-black/70 text-white px-3 py-1 h-8 flex items-center gap-2"
            title="Go to DAMITV Home"
          >
            <Home className="h-4 w-4" />
            <span className="font-bold text-sm">DAMITV</span>
          </Button>

          {/* Fullscreen Button */}
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
    </div>
  );
};

export default IframeVideoPlayer;
