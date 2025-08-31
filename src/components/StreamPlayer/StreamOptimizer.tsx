
import React, { useEffect } from 'react';
import { Stream } from '../../types/sports';

interface StreamOptimizerProps {
  stream: Stream | null;
}

const StreamOptimizer: React.FC<StreamOptimizerProps> = ({ stream }) => {
  useEffect(() => {
    if (!stream?.embedUrl) return;

    try {
      const url = new URL(stream.embedUrl);
      const domain = url.hostname;

      // Add DNS prefetch and preconnect for the stream domain
      const existingPrefetch = document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`);
      const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${url.origin}"]`);

      if (!existingPrefetch) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'dns-prefetch';
        prefetchLink.href = `//${domain}`;
        document.head.appendChild(prefetchLink);
      }

      if (!existingPreconnect) {
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = url.origin;
        preconnectLink.crossOrigin = 'anonymous';
        document.head.appendChild(preconnectLink);
      }

      // Add resource hints for better loading
      const resourceHint = document.createElement('link');
      resourceHint.rel = 'prefetch';
      resourceHint.href = stream.embedUrl;
      resourceHint.as = 'fetch';
      resourceHint.crossOrigin = 'anonymous';
      document.head.appendChild(resourceHint);

      // Cleanup function to remove the links when component unmounts
      return () => {
        const prefetchToRemove = document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`);
        const preconnectToRemove = document.querySelector(`link[rel="preconnect"][href="${url.origin}"]`);
        const resourceToRemove = document.querySelector(`link[rel="prefetch"][href="${stream.embedUrl}"]`);
        
        if (prefetchToRemove) document.head.removeChild(prefetchToRemove);
        if (preconnectToRemove) document.head.removeChild(preconnectToRemove);
        if (resourceToRemove) document.head.removeChild(resourceToRemove);
      };
    } catch (error) {
      // Silently fail for invalid URLs
    }
  }, [stream]);

  return null; // This component doesn't render anything
};

export default StreamOptimizer;
