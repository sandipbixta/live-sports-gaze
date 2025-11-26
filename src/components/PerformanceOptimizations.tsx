import { useEffect } from 'react';

/**
 * Performance Optimizations Component
 * Implements Core Web Vitals improvements:
 * - Preconnects to critical domains for faster resource loading
 * - Preloads critical fonts and assets
 * - Ensures optimal resource hints for LCP improvement
 */
export const PerformanceOptimizations = () => {
  useEffect(() => {
    // Preconnect to critical third-party domains
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.googletagmanager.com'
    ];

    criticalDomains.forEach(domain => {
      // Check if preconnect link already exists
      const existingLink = document.querySelector(`link[href="${domain}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // Optimize images with loading attributes
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img, index) => {
      // First few images: eager loading for LCP
      // Rest: lazy loading
      if (index < 3) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.setAttribute('loading', 'lazy');
      }
    });

    // Defer non-critical stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    stylesheets.forEach(stylesheet => {
      if (!stylesheet.hasAttribute('media')) {
        stylesheet.setAttribute('media', 'print');
        stylesheet.addEventListener('load', function() {
          this.media = 'all';
        });
      }
    });

  }, []);

  return null;
};

export default PerformanceOptimizations;
