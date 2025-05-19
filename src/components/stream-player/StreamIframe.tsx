
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
  
  // Enhanced URL processing - fix common issues with embed URLs
  const processEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Handle YouTube URLs specifically
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Ensure autoplay and controls are enabled for YouTube
      let processedUrl = url.includes('?') ? url : `${url}?`;
      if (!processedUrl.includes('autoplay=')) processedUrl += '&autoplay=1';
      if (!processedUrl.includes('controls=')) processedUrl += '&controls=1';
      return processedUrl;
    }
    
    // General URL processing
    return url
      .replace(/&amp;/g, '&')  // Fix encoded ampersands
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace
  };
  
  // Clean and prepare the embed URL
  const embedUrl = processEmbedUrl(stream.embedUrl);
  
  console.log('Processing stream URL:', {
    original: stream.embedUrl,
    processed: embedUrl
  });
  
  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <iframe 
        ref={iframeRef}
        src={embedUrl}
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
