
import React, { useRef, useEffect } from 'react';
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
  
  useEffect(() => {
    console.log('StreamIframe mounted with URL:', stream.embedUrl);
  }, [stream.embedUrl]);
  
  // Enhanced URL processing - fix common issues with embed URLs
  const processEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    console.log('Processing embed URL:', url);
    
    // Handle YouTube URLs specifically
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Ensure autoplay and controls are enabled for YouTube
      let processedUrl = url.includes('?') ? url : `${url}?`;
      if (!processedUrl.includes('autoplay=')) processedUrl += '&autoplay=1';
      if (!processedUrl.includes('controls=')) processedUrl += '&controls=1';
      return processedUrl;
    }
    
    // Special handling for streamed.su embedded URLs
    if (url.includes('streamed.su') || url.includes('streamhd.')) {
      // Make sure HTTPS protocol is used
      if (url.startsWith('http:')) {
        url = url.replace('http:', 'https:');
      }
      
      // Add any necessary parameters
      if (!url.includes('autoplay=')) {
        url = url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
      }
    }
    
    // General URL processing
    return url
      .replace(/&amp;/g, '&')  // Fix encoded ampersands
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace
  };
  
  // Clean and prepare the embed URL
  const embedUrl = processEmbedUrl(stream.embedUrl);
  
  console.log('Final processed URL:', embedUrl);
  
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
