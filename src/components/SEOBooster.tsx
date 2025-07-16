
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOBoosterProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

const SEOBooster: React.FC<SEOBoosterProps> = ({
  title = "DamiTV - Free Sports Streaming & TV Online",
  description = "Watch live sports and TV channels free online. Premier League, Champions League, NBA, NFL streaming. No registration required.",
  keywords = "free sports streaming, live sports, watch sports online, sports TV, free streaming, live matches",
  canonicalUrl = "https://damitv.pro",
  ogImage = "https://damitv.pro/og-image.jpg"
}) => {
  return (
    <Helmet>
      {/* Enhanced SEO Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="DamiTV" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 day" />
      <meta name="author" content="DamiTV" />
      
      {/* Performance and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#ff5a36" />
      <meta name="msapplication-TileColor" content="#ff5a36" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEOBooster;
