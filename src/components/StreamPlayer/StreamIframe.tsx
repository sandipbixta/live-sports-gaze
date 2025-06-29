
import React from 'react';
import { Stream } from '../../types/sports';
import { Loader } from 'lucide-react';

interface StreamIframeProps {
  stream: Stream;
  videoRef: React.RefObject<HTMLIFrameElement>;
  isContentLoaded: boolean;
  iframeTimeout: boolean;
  mobileStreamBlocked: boolean;
  retryCount: number;
  isMobile: boolean;
  onLoad: () => void;
  onError: () => void;
}

const StreamIframe: React.FC<StreamIframeProps> = ({
  stream,
  videoRef,
  isContentLoaded,
  iframeTimeout,
  mobileStreamBlocked,
  retryCount,
  isMobile,
  onLoad,
  onError
}) => {
  return (
    <>
      {!isContentLoaded && !iframeTimeout && !(mobileStreamBlocked && isMobile) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151922]">
          <div className="text-white text-center">
            <Loader className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mx-auto mb-2 sm:mb-3 text-[#ff5a36]" />
            <p className="text-sm sm:text-lg">Loading stream...</p>
            <p className="text-xs text-gray-400 mt-1">
              Connecting to {stream.source}...
            </p>
            {isMobile && (
              <p className="text-xs text-gray-400 mt-1">
                Optimizing for mobile...
              </p>
            )}
            {retryCount > 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                Retry attempt {retryCount}
              </p>
            )}
          </div>
        </div>
      )}
      
      <iframe 
        ref={videoRef}
        src={stream.embedUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        title="Live Sports Stream"
        onLoad={onLoad}
        onError={onError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-downloads"
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
    </>
  );
};

export default StreamIframe;
