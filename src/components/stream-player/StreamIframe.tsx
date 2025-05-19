
import React, { useRef, useEffect, useState } from 'react';
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
  const [iframeKey, setIframeKey] = useState<string>(`${stream.source}-${stream.id}`);
  
  useEffect(() => {
    console.log('StreamIframe mounted with URL:', stream.embedUrl);
    // Generate a new key when stream changes to force iframe reload
    setIframeKey(`${stream.source}-${stream.id}-${Date.now()}`);
  }, [stream.embedUrl, stream.source, stream.id]);
  
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
      if (!processedUrl.includes('origin=')) {
        processedUrl += `&origin=${encodeURIComponent(window.location.origin)}`;
      }
      console.log('Processed YouTube URL:', processedUrl);
      return processedUrl;
    }
    
    // Handle direct source URLs
    if (url.includes('/embed/') || url.includes('player.')) {
      let processedUrl = url
        .replace(/&amp;/g, '&')  // Fix encoded ampersands
        .replace(/^\s+|\s+$/g, ''); // Trim whitespace
        
      // Add autoplay parameter if not present
      if (!processedUrl.includes('autoplay=')) {
        processedUrl = processedUrl.includes('?') ? 
          `${processedUrl}&autoplay=1` : 
          `${processedUrl}?autoplay=1`;
      }
      
      // Add allow=autoplay for browsers that require it
      if (!processedUrl.includes('allow=')) {
        processedUrl = `${processedUrl}&allow=autoplay`;
      }
      
      console.log('Processed embed URL:', processedUrl);
      return processedUrl;
    }
    
    // General URL processing
    let processedUrl = url
      .replace(/&amp;/g, '&')  // Fix encoded ampersands
      .replace(/^\s+|\s+$/g, ''); // Trim whitespace
      
    // Ensure URL has proper protocol
    if (!processedUrl.startsWith('http')) {
      processedUrl = processedUrl.startsWith('//') ? 
        `https:${processedUrl}` : 
        `https://${processedUrl}`;
    }
      
    // Add autoplay parameter if not present
    if (!processedUrl.includes('autoplay=')) {
      processedUrl = processedUrl.includes('?') ? 
        `${processedUrl}&autoplay=1` : 
        `${processedUrl}?autoplay=1`;
    }
    
    console.log('Final processed URL:', processedUrl);
    return processedUrl;
  };
  
  // Clean and prepare the embed URL
  const embedUrl = processEmbedUrl(stream.embedUrl);
  
  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <iframe 
        key={iframeKey}
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
        referrerPolicy="origin"
      ></iframe>
    </AspectRatio>
  );
};

export default StreamIframe;
