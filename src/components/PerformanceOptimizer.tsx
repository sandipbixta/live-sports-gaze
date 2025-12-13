import { useEffect } from 'react';
import { prefetchOnIdle } from '@/services/cachedFetch';

const PerformanceOptimizer: React.FC = () => {
  useEffect(() => {
    // Preconnect to critical domains
    const preconnectDomains = [
      'https://api.cdn-live.tv',
      'https://r2.thesportsdb.com',
      'https://www.thesportsdb.com',
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for API domains
    const dnsPrefetchDomains = [
      'https://cdn-live.tv',
      'https://thesportsdb.com',
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Prefetch critical API data on idle
    prefetchOnIdle([
      'https://api.cdn-live.tv/api/v1/vip/damitv/events/sports/',
    ]);

    // Optimize images loading - run once after initial paint
    const optimizeImages = () => {
      // Add loading="lazy" and decoding="async" to images
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        if (img instanceof HTMLImageElement) {
          img.loading = 'lazy';
          img.decoding = 'async';
        }
      });
    };

    // Run image optimization after initial paint
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(optimizeImages, { timeout: 2000 });
    } else {
      setTimeout(optimizeImages, 1000);
    }

    // Observe for new images added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLImageElement && !node.loading) {
            node.loading = 'lazy';
            node.decoding = 'async';
          }
          if (node instanceof HTMLElement) {
            node.querySelectorAll('img:not([loading])').forEach(img => {
              if (img instanceof HTMLImageElement) {
                img.loading = 'lazy';
                img.decoding = 'async';
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;