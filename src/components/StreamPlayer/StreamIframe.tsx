
import React, { useEffect, useState } from 'react';
import { Match } from '../../types/sports';
import { ManualMatch } from '../../types/manualMatch';

interface StreamIframeProps {
  src: string;
  onLoad: () => void;
  onError: () => void;
  videoRef: React.RefObject<HTMLIFrameElement>;
  match?: Match | ManualMatch | null;
}

const StreamIframe: React.FC<StreamIframeProps> = ({ src, onLoad, onError, videoRef, match }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}
      
      <iframe 
        ref={videoRef}
        src={src}
        className="w-full h-full"
        allowFullScreen
        title="Live Sports Stream - DAMITV"
        onLoad={handleLoad}
        onError={onError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        referrerPolicy="origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="eager"
        style={{ 
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default StreamIframe;
