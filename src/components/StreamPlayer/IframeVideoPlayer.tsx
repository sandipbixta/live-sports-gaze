
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [hasErrored, setHasErrored] = useState(false);

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
        iframeRef.current.requestFullscreen().catch(console.error);
      }
    }
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log('✅ Iframe content loaded successfully');
    setIsLoading(false);
    setHasErrored(false);
    onLoad();
  };

  // Handle iframe load error
  const handleIframeError = () => {
    console.error('❌ Iframe failed to load');
    setIsLoading(false);
    setHasErrored(true);
    onError();
  };

  // Smart iframe loading with better PC compatibility
  useEffect(() => {
    if (!src) return;
    
    console.log('🔄 Loading iframe with src:', src.substring(0, 80) + '...');
    setIsLoading(true);
    setHasErrored(false);
    setLoadAttempts(prev => prev + 1);
    
    if (iframeRef.current) {
      // For PC, we need to handle the iframe loading more carefully
      iframeRef.current.src = src;
    }
  }, [src]);

  // PC-specific timeout handling
  useEffect(() => {
    if (!isLoading) return;
    
    const timeout = setTimeout(() => {
      if (isLoading && !hasErrored) {
        console.log('⏰ Iframe load timeout - assuming success for PC compatibility');
        setIsLoading(false);
        onLoad(); // Assume success on PC after timeout
      }
    }, isMobile ? 10000 : 8000); // Shorter timeout for PC

    return () => clearTimeout(timeout);
  }, [isLoading, hasErrored, onLoad, isMobile]);

  // Auto-hide controls with better PC interaction
  useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, isMobile ? 3000 : 5000); // Longer for PC

    const handleInteraction = () => {
      setShowControls(true);
    };

    const container = iframeRef.current?.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleInteraction);
      container.addEventListener('click', handleInteraction);
      return () => {
        container.removeEventListener('mousemove', handleInteraction);
        container.removeEventListener('click', handleInteraction);
        clearTimeout(timer);
      };
    }

    return () => clearTimeout(timer);
  }, [showControls, isMobile]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Loading indicator - show only initially */}
      {isLoading && loadAttempts <= 1 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#151922]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading stream...</p>
            <p className="text-xs text-gray-400 mt-1">
              {isMobile ? 'Optimizing for mobile...' : 'Preparing video player...'}
            </p>
          </div>
        </div>
      )}

      <iframe 
        ref={iframeRef}
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
          <div className="w-20"></div>
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
