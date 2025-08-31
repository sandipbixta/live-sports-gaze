import React from 'react';
import { Link } from 'react-router-dom';

interface InternalLinkingProps {
  currentPage: 'home' | 'live' | 'channels' | 'schedule' | 'match' | 'news';
  matchInfo?: {
    homeTeam?: string;
    awayTeam?: string;
    league?: string;
  };
}

const InternalLinking: React.FC<InternalLinkingProps> = ({
  currentPage,
  matchInfo
}) => {
  const generateContextualLinks = () => {
    const baseLinks = {
      home: [
        { text: 'Watch Live Sports Streaming', url: '/live', rel: 'related' },
        { text: 'Sports TV Channels', url: '/channels', rel: 'related' },
        { text: 'Football Match Schedule', url: '/schedule', rel: 'related' },
        { text: 'Sports News Updates', url: '/news', rel: 'related' }
      ],
      live: [
        { text: 'Home - Free Sports Streaming', url: '/', rel: 'home' },
        { text: 'TV Channels Guide', url: '/channels', rel: 'related' },
        { text: 'Match Schedule Today', url: '/schedule', rel: 'related' },
        { text: 'Latest Sports News', url: '/news', rel: 'related' }
      ],
      channels: [
        { text: 'Live Sports Now', url: '/live', rel: 'related' },
        { text: 'Home Page', url: '/', rel: 'home' },
        { text: 'Sports Schedule', url: '/schedule', rel: 'related' },
        { text: 'Sports News', url: '/news', rel: 'related' }
      ],
      schedule: [
        { text: 'Watch Live Now', url: '/live', rel: 'related' },
        { text: 'Sports Channels', url: '/channels', rel: 'related' },
        { text: 'Home', url: '/', rel: 'home' },
        { text: 'News & Updates', url: '/news', rel: 'related' }
      ],
      match: [
        { text: 'All Live Matches', url: '/live', rel: 'up' },
        { text: 'Sports Schedule', url: '/schedule', rel: 'related' },
        { text: 'TV Channels', url: '/channels', rel: 'related' },
        { text: 'Home', url: '/', rel: 'home' }
      ],
      news: [
        { text: 'Live Sports', url: '/live', rel: 'related' },
        { text: 'Match Schedule', url: '/schedule', rel: 'related' },
        { text: 'Sports Channels', url: '/channels', rel: 'related' },
        { text: 'Home', url: '/', rel: 'home' }
      ]
    };

    let links = baseLinks[currentPage] || [];

    // Add match-specific links if available
    if (matchInfo && currentPage === 'match') {
      const { homeTeam, awayTeam, league } = matchInfo;
      if (homeTeam || awayTeam || league) {
        links = [
          ...links,
          { text: `More ${league || 'Football'} Matches`, url: '/live', rel: 'related' },
          { text: `${homeTeam || awayTeam} Team News`, url: '/news', rel: 'related' }
        ];
      }
    }

    return links;
  };

  const links = generateContextualLinks();

  return (
    <div className="hidden">
      {/* Hidden internal links for SEO crawlers */}
      <nav aria-label="Internal site navigation" role="navigation">
        <ul>
          {links.map((link, index) => (
            <li key={index}>
              <Link 
                to={link.url} 
                rel={link.rel}
                title={link.text}
                aria-label={link.text}
              >
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Additional contextual keywords for SEO */}
      <div className="seo-keywords">
        <span>free sports streaming, live football online, watch sports free, sports tv channels, live match streaming, football live stream, soccer streaming, sports schedule, live sports tv</span>
      </div>
    </div>
  );
};

export default InternalLinking;