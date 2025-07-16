
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type?: 'website' | 'sportsEvent' | 'organization';
  data?: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type = 'website', data }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DamiTV",
          "url": "https://damitv.pro",
          "description": "Free live sports streaming and TV channels online. Watch Premier League, Champions League, NBA, and more.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://damitv.pro/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://twitter.com/damitv",
            "https://facebook.com/damitv",
            "https://instagram.com/damitv"
          ]
        };
      
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "DamiTV",
          "url": "https://damitv.pro",
          "logo": "https://damitv.pro/logo.png",
          "description": "Your premium destination for free live sports streaming and TV channels.",
          "sameAs": [
            "https://twitter.com/damitv",
            "https://facebook.com/damitv",
            "https://instagram.com/damitv"
          ]
        };
      
      case 'sportsEvent':
        return {
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": data?.name || "Live Sports Event",
          "description": data?.description || "Watch live sports streaming free",
          "startDate": data?.startDate,
          "location": {
            "@type": "Place",
            "name": data?.venue || "Online"
          },
          "organizer": {
            "@type": "Organization",
            "name": "DamiTV"
          },
          "isLiveBroadcast": true,
          "broadcastOfEvent": {
            "@type": "Event",
            "name": data?.name
          }
        };
      
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
