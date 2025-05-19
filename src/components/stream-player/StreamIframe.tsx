
import React, { useRef } from 'react';
import { Stream } from '../../types/sports';
import { AspectRatio } from '../ui/aspect-ratio';

interface StreamIframeProps {
  stream: Stream;
  onLoad: () => void;
  onError: (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => void;
}

const StreamIframe: React.FC<StreamIframeProps> = ({ 
  stream,
  onLoad,
  onError
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Clean up the URL to improve compatibility
  const cleanUrl = stream.embedUrl
    .replace('autoplay=1', 'autoplay=0') // Set autoplay off by default
    .replace('muted=1', 'muted=0');      // Unmute by default
  
  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <iframe 
        ref={iframeRef}
        src={cleanUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen={true}
        title="Live Sports Stream"
        onLoad={onLoad}
        onError={onError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        loading="lazy"
      ></iframe>
    </AspectRatio>
  );
};

export default StreamIframe;
