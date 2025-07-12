
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
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState('');

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
    setIsLoading(false);
    onLoad();
  };

  // Handle iframe load error
  const handleIframeError = () => {
    console.error('❌ Iframe failed to load');
    setIsLoading(false);
    onError();
  };

  // Force reload iframe when src changes (critical for page refreshes)
  useEffect(() => {
    if (src && src !== currentSrc) {
      console.log('🔄 New src detected, forcing iframe reload:', src.substring(0, 50) + '...');
      
      setCurrentSrc(src);
      setHasLoaded(false);
      setIsLoading(true);
      
      if (iframeRef.current) {
        // Force complete iframe reload by clearing and setting src
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = src;
          }
        }, 100);
      }
    }
  }, [src, currentSrc]);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 4000);

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

  // Set a reasonable timeout for iframe loading with retry
  useEffect(() => {
    if (isLoading && src) {
      const timeout = setTimeout(() => {
        if (!hasLoaded && isLoading) {
          console.log('📺 Iframe taking too long, trying to reload...');
          // Try to reload the iframe
          if (iframeRef.current) {
            const currentSrcValue = iframeRef.current.src;
            iframeRef.current.src = '';
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.src = currentSrcValue;
              }
            }, 500);
          }
          onLoad(); // Assume loaded to prevent infinite loading
        }
      }, 8000); // 8 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasLoaded, onLoad, src]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#151922]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading stream...</p>
            <p className="text-xs text-gray-400 mt-1">Please wait...</p>
          </div>
        </div>
      )}

      <iframe 
        ref={iframeRef}
        src={currentSrc || src}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        title={title || "Live Stream"}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-top-navigation allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer"
        loading="eager"
        style={{ 
          border: 'none',
          pointerEvents: 'auto'
        }}
      />

      {/* Always Visible DAMITV Home Button - Top Center */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          variant="ghost"
          onClick={handleHomeClick}
          className="bg-black/80 hover:bg-black/90 text-white px-2 py-1 h-7 flex items-center gap-1 border border-white/20 shadow-lg"
          title="Go to DAMITV Home"
        >
          <Home className="h-3 w-3" />
          <span className="font-bold text-xs">DAMITV</span>
        </Button>
      </div>

      {/* Control Overlay */}
      <div 
        className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        <div className="flex items-center justify-between">
          {/* Left spacer for back buttons */}
          <div className="w-20"></div>

          {/* Right side - Fullscreen Button */}
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
