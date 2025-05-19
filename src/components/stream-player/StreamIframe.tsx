
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
    // Force iframe reload when stream changes
    setIframeKey(`${stream.source}-${stream.id}-${Date.now()}`);
    
    // Add event listeners to detect when iframe is fully loaded
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', onLoad);
    }
    
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', onLoad);
      }
    };
  }, [stream.embedUrl, stream.source, stream.id, onLoad]);
  
  // Enhanced URL processing for better cross-browser compatibility
  const processEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    console.log('Processing embed URL:', url);
    
    // Decode URL
    let processedUrl = decodeURIComponent(url);
    
    // Handle YouTube URLs specifically
    if (processedUrl.includes('youtube.com') || processedUrl.includes('youtu.be')) {
      // Ensure autoplay and controls are enabled for YouTube
      let ytUrl = processedUrl.includes('?') ? processedUrl : `${processedUrl}?`;
      if (!ytUrl.includes('autoplay=')) ytUrl += '&autoplay=1';
      if (!ytUrl.includes('controls=')) ytUrl += '&controls=1';
      if (!ytUrl.includes('origin=')) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        ytUrl += `&origin=${encodeURIComponent(origin)}`;
      }
      console.log('Processed YouTube URL:', ytUrl);
      return ytUrl;
    }
    
    // Ensure URL has proper protocol
    if (!processedUrl.startsWith('http')) {
      processedUrl = processedUrl.startsWith('//') ? 
        `https:${processedUrl}` : 
        `https://${processedUrl}`;
    }
    
    // Add autoplay parameter if not present for other types of embeds
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
        className="w-full h-full absolute inset-0 border-0"
        allowFullScreen={true}
        title="Live Sports Stream"
        onLoad={onLoad}
        onError={onError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        loading="eager"
        referrerPolicy="origin"
      ></iframe>
    </AspectRatio>
  );
};

export default StreamIframe;
