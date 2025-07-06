
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

  return (
    <iframe 
      ref={videoRef}
      src={src}
      className="w-full h-full absolute inset-0"
      allowFullScreen
      title="Live Sports Stream - DAMITV"
      onLoad={onLoad}
      onError={onError}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads allow-top-navigation"
      referrerPolicy="no-referrer"
      loading="eager"
      style={{ 
        border: 'none',
        ...(isMobile && {
          touchAction: 'manipulation',
          WebkitOverflowScrolling: 'touch'
        })
      }}
    />
  );
};

export default StreamIframe;
