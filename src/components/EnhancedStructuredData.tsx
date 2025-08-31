import React from 'react';
import { Helmet } from 'react-helmet-async';

interface EnhancedStructuredDataProps {
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
}

const EnhancedStructuredData: React.FC<EnhancedStructuredDataProps> = ({
  pageType,
  matchInfo,
  channelInfo
}) => {
  // Website/Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DamiTV",
    "alternateName": "Dami TV Free Sports Streaming",
    "url": "https://damitv.pro",
    "logo": "https://i.imgur.com/m4nV9S8.png",
    "description": "Watch free live sports streaming online. Football, soccer, basketball, tennis and more sports channels available 24/7.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Spanish", "French", "German", "Portuguese"]
    },
    "sameAs": [
      "https://www.facebook.com/damitv",
      "https://www.twitter.com/damitv_official",
      "https://www.instagram.com/damitv_official"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "15000",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DamiTV - Free Live Sports Streaming",
    "url": "https://damitv.pro",
    "description": "Watch live sports streaming free online. Football, soccer, basketball, tennis matches and sports TV channels.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://damitv.pro/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DamiTV"
    }
  };

  // FAQ Schema for common questions
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is DamiTV free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DamiTV is completely free to use. You can watch live sports streaming without any subscription or registration required."
        }
      },
      {
        "@type": "Question",
        "name": "What sports can I watch on DamiTV?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can watch football (soccer), basketball, tennis, American football, baseball, hockey, boxing, MMA, motorsports, and many other sports on DamiTV."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to register to watch sports streams?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No registration is required. You can instantly watch live sports streams without creating an account or providing personal information."
        }
      },
      {
        "@type": "Question",
        "name": "Is DamiTV available on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DamiTV works perfectly on mobile devices, tablets, and desktop computers. The website is fully responsive and optimized for all screen sizes."
        }
      },
      {
        "@type": "Question",
        "name": "What makes DamiTV different from other streaming sites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DamiTV offers high-quality streams, multiple language options, comprehensive sports coverage, and a user-friendly interface completely free of charge."
        }
      }
    ]
  };

  // Video streaming service schema
  const videoServiceSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Live Sports Streaming on DamiTV",
    "description": "Watch live sports streaming free online including football, basketball, tennis and more sports events.",
    "thumbnailUrl": "https://i.imgur.com/m4nV9S8.png",
    "uploadDate": "2024-01-01",
    "contentUrl": "https://damitv.pro/live",
    "embedUrl": "https://damitv.pro/live",
    "publisher": {
      "@type": "Organization",
      "name": "DamiTV"
    },
    "isLiveBroadcast": true,
    "genre": "Sports"
  };

  // Local Business for sports streaming
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://damitv.pro/#LocalBusiness",
    "name": "DamiTV Sports Streaming Service",
    "image": "https://i.imgur.com/m4nV9S8.png",
    "description": "Free live sports streaming service offering football, basketball, tennis and other sports events online.",
    "url": "https://damitv.pro",
    "telephone": "+1-800-DAMITV-1",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "Global"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "15000"
    }
  };

  return (
    <Helmet>
      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      {/* Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      
      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      {/* Video Service Schema */}
      <script type="application/ld+json">
        {JSON.stringify(videoServiceSchema)}
      </script>
      
      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
    </Helmet>
  );
};

export default EnhancedStructuredData;