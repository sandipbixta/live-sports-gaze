import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateCompetitorKeywords } from '../utils/competitorSEO';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  breadcrumbs?: Array<{name: string; url: string}>;
  includeCompetitorKeywords?: boolean;
  matchInfo?: {
    homeTeam?: string;
    awayTeam?: string;
    league?: string;
    date?: Date;
    venue?: string;
  };
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://i.imgur.com/m4nV9S8.png',
  structuredData,
  breadcrumbs,
  includeCompetitorKeywords = true,
  matchInfo
}) => {
  // Debug logging
  console.log('SEOMetaTags - canonicalUrl:', canonicalUrl);
  console.log('SEOMetaTags - title:', title);
  console.log('SEOMetaTags - ogImage:', ogImage);
  
  // Generate dynamic keywords based on match info and competitor targeting
  const generateKeywords = () => {
    let baseKeywords = keywords || 'live sports streaming, watch sports online, free sports streams';
    
    if (matchInfo) {
      const { homeTeam, awayTeam, league } = matchInfo;
      const matchKeywords = [
        homeTeam && `${homeTeam} live stream`,
        awayTeam && `${awayTeam} online`,
        homeTeam && awayTeam && `${homeTeam} vs ${awayTeam}`,
        league && `${league} streaming`,
        'live football stream',
        'watch football online free'
      ].filter(Boolean).join(', ');
      
      baseKeywords = `${baseKeywords}, ${matchKeywords}`;
    }
    
    // Add competitor keywords for better search visibility
    if (includeCompetitorKeywords) {
      return generateCompetitorKeywords(baseKeywords);
    }
    
    return baseKeywords;
  };

  // Generate structured data for matches
  const generateMatchStructuredData = () => {
    if (!matchInfo) return structuredData;

    const { homeTeam, awayTeam, league, date, venue } = matchInfo;
    
    if (homeTeam && awayTeam && date) {
      return {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        "name": `${homeTeam} vs ${awayTeam}`,
        "description": `Watch ${homeTeam} vs ${awayTeam} live stream online for free on DamiTV`,
        "startDate": date.toISOString(),
        "competitor": [
          {
            "@type": "SportsTeam",
            "name": homeTeam
          },
          {
            "@type": "SportsTeam", 
            "name": awayTeam
          }
        ],
        "sport": league || "Football",
        "location": venue ? {
          "@type": "Place",
          "name": venue
        } : undefined,
        "organizer": {
          "@type": "Organization",
          "name": "DamiTV",
          "url": "https://damitv.pro"
        },
        "url": canonicalUrl || window.location.href,
        "image": ogImage,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": canonicalUrl || window.location.href
        }
      };
    }

    return structuredData;
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbData = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  };

  const finalStructuredData = generateMatchStructuredData();
  const breadcrumbData = generateBreadcrumbData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={generateKeywords()} />
      
      {/* Enhanced SEO Meta Tags */}
      <meta name="author" content="DamiTV" />
      <meta name="language" content="en" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="revisit-after" content="1 day" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="referrer" content="no-referrer-when-downgrade" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Enhanced */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={matchInfo ? "article" : "website"} />
      <meta property="og:site_name" content="DamiTV - Free Live Sports Streaming" />
      <meta property="og:locale" content="en_US" />
      <meta property="fb:app_id" content="1084728339725005" />
      
      {/* Enhanced properties for match pages */}
      {matchInfo && (
        <>
          <meta property="article:author" content="DamiTV" />
          <meta property="article:publisher" content="https://www.facebook.com/damitv" />
          <meta property="article:section" content="Sports" />
          <meta property="article:tag" content={`${matchInfo.homeTeam}, ${matchInfo.awayTeam}, live stream, ${matchInfo.league}`} />
          <meta property="article:published_time" content={matchInfo.date?.toISOString()} />
          <meta property="og:video:tag" content="live stream" />
          <meta property="og:video:tag" content="sports" />
          <meta property="og:video:tag" content="football" />
        </>
      )}
      
      {!matchInfo && (
        <>
          <meta property="article:author" content="DamiTV" />
          <meta property="article:publisher" content="https://www.facebook.com/damitv" />
          <meta property="article:section" content="Sports" />
          <meta property="article:tag" content="live sports, streaming, football, soccer" />
        </>
      )}
      
      {/* Twitter Cards Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@damitv_official" />
      <meta name="twitter:creator" content="@damitv_official" />
      <meta name="twitter:domain" content="damitv.pro" />
      
      {/* Mobile & App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="DamiTV" />
      <meta name="application-name" content="DamiTV" />
      <meta name="theme-color" content="#1a1a2e" />
      <meta name="msapplication-TileColor" content="#1a1a2e" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow" />
      <meta name="slurp" content="index, follow" />
      
      {/* Performance & Resource Hints */}
      <link rel="dns-prefetch" href="//embedsports.top" />
      <link rel="dns-prefetch" href="//veplay.top" />
      <link rel="dns-prefetch" href="//google-analytics.com" />
      <link rel="dns-prefetch" href="//googletagmanager.com" />
      <link rel="preconnect" href="//embedsports.top" />
      <link rel="preconnect" href="//veplay.top" />
      <link rel="preload" href={ogImage} as="image" />
      
      {/* Security */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Additional Schema Links */}
      <link rel="alternate" type="application/rss+xml" title="DamiTV Sports News" href="/rss.xml" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      
      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOMetaTags;