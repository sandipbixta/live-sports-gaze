
import React from 'react';
import { Helmet } from 'react-helmet-async';

const LiveSEO: React.FC = () => {
  return (
    <Helmet>
      <title>Live Sports Streaming | Watch Live Football Matches Online Free | DamiTV</title>
      <meta name="description" content="Watch live football matches, soccer games, and sports events streaming online for free. No registration required to stream live sports on DamiTV." />
      <meta name="keywords" content="live football streaming, live soccer matches, watch sports online, free live sports, stream football live" />
      <link rel="canonical" href="https://damitv.pro/live" />
      {/* Schema.org structured data for live sports events */}
      <script type="application/ld+json">
      {`
        {
          "@context": "https://schema.org",
          "@type": "BroadcastEvent",
          "name": "Live Sports Streaming",
          "description": "Watch live football matches and sports events online",
          "url": "https://damitv.pro/live",
          "isLiveBroadcast": true,
          "startDate": "${new Date().toISOString()}",
          "broadcastOfEvent": {
            "@type": "SportsEvent",
            "name": "Live Football Matches"
          },
          "videoFormat": "HD"
        }
      `}
      </script>
    </Helmet>
  );
};

export default LiveSEO;
