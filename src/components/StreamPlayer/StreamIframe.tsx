
import React from 'react';
import { useIsMobile } from '../../hooks/use-mobile';

interface StreamIframeProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  videoRef: React.RefObject<HTMLIFrameElement>;
}

const StreamIframe: React.FC<StreamIframeProps> = ({ src, onLoad, onError, videoRef }) => {
  const isMobile = useIsMobile();

  // Handle iframe clicks on mobile to prevent automatic opening
  const handleIframeClick = (e: React.MouseEvent) => {
    if (isMobile) {
      // Prevent default behavior that might cause automatic opening
      e.preventDefault();
      console.log('Mobile iframe click prevented');
    }
  };

  return (
    <iframe 
      ref={videoRef}
      src={src}
      className="w-full h-full absolute inset-0"
      allowFullScreen
      title="Live Sports Stream - DAMITV"
      onLoad={onLoad}
      onError={onError}
      onClick={handleIframeClick}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-top-navigation"
      referrerPolicy="strict-origin-when-cross-origin"
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
  );
};

export default StreamIframe;
