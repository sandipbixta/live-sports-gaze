import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InternalLinking from './InternalLinking';
import EnhancedStructuredData from './EnhancedStructuredData';
import SEOBreadcrumbs from './SEOBreadcrumbs';

interface AdvancedSEOOptimizerProps {
  pageType: 'home' | 'live' | 'channels' | 'schedule' | 'match' | 'news';
  matchInfo?: {
    homeTeam?: string;
    awayTeam?: string;
    league?: string;
    date?: Date;
    venue?: string;
  };
  channelInfo?: {
    name?: string;
    genre?: string;
    language?: string;
  };
  breadcrumbs?: Array<{name: string; url: string}>;
}

const AdvancedSEOOptimizer: React.FC<AdvancedSEOOptimizerProps> = ({
  pageType,
  matchInfo,
  channelInfo,
  breadcrumbs = []
}) => {
  const location = useLocation();

  useEffect(() => {
    // Performance optimizations for SEO
    
    // Preload critical resources
    const criticalResources = [
      '//fonts.googleapis.com',
      '//cdnjs.cloudflare.com',
      '//jsdelivr.net'
    ];
    
    criticalResources.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Add hreflang attributes for international SEO
    const hreflangLinks = [
      { lang: 'en', url: 'https://damitv.pro' },
      { lang: 'es', url: 'https://damitv.pro/es' },
      { lang: 'fr', url: 'https://damitv.pro/fr' },
      { lang: 'de', url: 'https://damitv.pro/de' },
      { lang: 'pt', url: 'https://damitv.pro/pt' },
      { lang: 'it', url: 'https://damitv.pro/it' }
    ];

    hreflangLinks.forEach(({ lang, url }) => {
      const existing = document.querySelector(`link[hreflang="${lang}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = url + location.pathname;
        document.head.appendChild(link);
      }
    });

    // Add viewport meta if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      document.head.appendChild(viewport);
    }

    // Add security headers via meta tags
    const securityMetas = [
      { name: 'referrer', content: 'no-referrer-when-downgrade' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'SAMEORIGIN' }
    ];

    securityMetas.forEach(meta => {
      const existing = document.querySelector(`meta[name="${meta.name}"], meta[http-equiv="${meta.httpEquiv}"]`);
      if (!existing) {
        const metaElement = document.createElement('meta');
        if (meta.name) metaElement.name = meta.name;
        if (meta.httpEquiv) metaElement.httpEquiv = meta.httpEquiv;
        metaElement.content = meta.content;
        document.head.appendChild(metaElement);
      }
    });

  }, [location.pathname]);

  return (
    <>
      {/* Enhanced Structured Data */}
      <EnhancedStructuredData 
        pageType={pageType}
        matchInfo={matchInfo}
        channelInfo={channelInfo}
      />
      
      {/* Internal Linking for SEO */}
      <InternalLinking 
        currentPage={pageType}
        matchInfo={matchInfo}
      />
      
      {/* SEO Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <SEOBreadcrumbs breadcrumbs={breadcrumbs} />
      )}
      
      {/* Additional SEO Meta Tags */}
      <div className="hidden">
        {/* Page-specific JSON-LD for rich snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": document.title,
            "description": document.querySelector('meta[name="description"]')?.getAttribute('content'),
            "url": window.location.href,
            "mainEntity": {
              "@type": "VideoObject",
              "name": "Live Sports Streaming",
              "description": "Watch live sports streaming free online",
              "thumbnailUrl": "https://i.imgur.com/m4nV9S8.png",
              "contentUrl": window.location.href,
              "embedUrl": window.location.href,
              "uploadDate": new Date().toISOString().split('T')[0],
              "duration": "PT3H",
              "genre": "Sports"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://damitv.pro/"
                },
                ...breadcrumbs.map((crumb, index) => ({
                  "@type": "ListItem",
                  "position": index + 2,
                  "name": crumb.name,
                  "item": `https://damitv.pro${crumb.url}`
                }))
              ]
            }
          })}
        </script>
        
        {/* Additional keywords for current page */}
        <div className="seo-content" style={{display: 'none', visibility: 'hidden'}}>
          <h1>Free Live Sports Streaming - Watch {pageType === 'match' && matchInfo ? `${matchInfo.homeTeam} vs ${matchInfo.awayTeam}` : 'Sports'} Online</h1>
          <p>
            DamiTV offers the best free live sports streaming experience with HD quality streams,
            no registration required, and comprehensive coverage of all major sports and leagues worldwide.
            Watch football, soccer, basketball, tennis, and more sports live online for free.
          </p>
          <h2>Why Choose DamiTV for Free Sports Streaming?</h2>
          <ul>
            <li>100% Free - No subscription or registration required</li>
            <li>HD Quality Streams - Crystal clear video and audio</li>
            <li>Global Coverage - Sports from around the world</li>
            <li>Mobile Optimized - Works on all devices</li>
            <li>Safe and Secure - No malicious ads or redirects</li>
            <li>Fast Loading - Optimized for quick stream startup</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdvancedSEOOptimizer;