
import React from 'react';
import PageLayout from '../components/PageLayout';
import ChannelsGrid from '../components/ChannelsGrid';
import Advertisement from '../components/Advertisement';
import NewsSection from '../components/NewsSection';
import { useIsMobile } from '../hooks/use-mobile';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const Channels = () => {
  const isMobile = useIsMobile();
  
  return (
    <PageLayout>
      <Helmet>
        <title>Live TV Channels | DamiTV - Stream International Sports</title>
        <meta name="description" content="Watch live international sports TV channels from around the world. Stream football, basketball, tennis and more sports channels in HD quality for free." />
        <meta name="keywords" content="live tv channels, sports tv, international channels, football streaming, basketball streaming, free sports channels" />
        <link rel="canonical" href="https://damitv.pro/channels" />
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "BroadcastService",
            "name": "DamiTV Sports Channels",
            "url": "https://damitv.pro/channels",
            "broadcastDisplayName": "DamiTV",
            "broadcastTimezone": "UTC",
            "broadcaster": {
              "@type": "Organization",
              "name": "DamiTV Sports"
            }
          }
        `}
        </script>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Live TV Channels</h1>
        <p className="text-gray-300 mb-6">
          Watch international sports channels from around the world. Select a country and channel to start streaming.
        </p>
        
        {/* Single ad placement before channel grid - responsive */}
        <div className={`mb-6 ${isMobile ? 'overflow-x-hidden' : ''}`}>
          <Advertisement type="banner" className="w-full" />
        </div>
        
        <ChannelsGrid />
        
        {/* Cross-promotion for News section */}
        <div className="my-8 bg-gradient-to-r from-[#242836] to-[#1A1F2C] rounded-xl p-5 border border-[#343a4d] flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Latest Sports Updates</h3>
            <p className="text-sm text-gray-300">Get breaking news and match reports</p>
          </div>
          <Link to="/news">
            <Button className="bg-[#fa2d04] hover:bg-[#e02703]">
              Visit News Section
            </Button>
          </Link>
        </div>
        
        {/* Sports News section */}
        <div className="mt-8">
          <NewsSection />
        </div>
      </div>
    </PageLayout>
  );
};

export default Channels;
