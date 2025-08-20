
import React, { useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ChannelsGrid from '../components/ChannelsGrid';
import Advertisement from '../components/Advertisement';
import NewsSection from '../components/NewsSection';
import { useIsMobile } from '../hooks/use-mobile';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Calendar } from 'lucide-react';
import TelegramBanner from '../components/TelegramBanner';

const Channels = () => {
  const isMobile = useIsMobile();
  
  // Log when the Channels page loads
  useEffect(() => {
    console.log('Channels page loaded', new Date().toISOString());
    console.log('EPG data will be loaded for all available countries');
  }, []);
  
  return (
    <PageLayout>
      <Helmet>
        <title>Live TV Channels | Watch Football Streams | DamiTV - Stream International Sports</title>
        <meta name="description" content="Watch free live football TV channels, Premier League, Champions League, La Liga streams and more. Stream international sports TV channels in HD quality - updated daily with trending games." />
        <meta name="keywords" content="live tv channels, sports tv, football streams, live football, premier league stream, champions league stream, free sports channels, tv guide, epg" />
        <link rel="canonical" href="https://damitv.pro/channels" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        <meta property="og:title" content="Live TV Channels & Football Streams | DamiTV Sports" />
        <meta property="og:description" content="Watch free live football streams, Premier League, Champions League, La Liga and all major sports. Updated with trending games daily." />
        <meta property="og:url" content="https://damitv.pro/channels" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://i.imgur.com/m4nV9S8.png" />
        
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
              "name": "DamiTV Sports",
              "url": "https://damitv.pro"
            },
            "inLanguage": "en",
            "potentialAction": {
              "@type": "WatchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://damitv.pro/channels"
              }
            },
            "about": {
              "@type": "Thing",
              "name": "Football Streaming",
              "description": "Watch football streams, Premier League, Champions League, La Liga and all major leagues"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://damitv.pro/channels"
            }
          }
        `}
        </script>
        
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "SportsEvent",
                  "name": "Premier League Live Streams",
                  "url": "https://damitv.pro/channels",
                  "location": {
                    "@type": "VirtualLocation",
                    "name": "DamiTV"
                  },
                  "description": "Watch all Premier League matches live on DamiTV"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "SportsEvent",
                  "name": "Champions League Live Streams",
                  "url": "https://damitv.pro/channels",
                  "location": {
                    "@type": "VirtualLocation",
                    "name": "DamiTV"
                  },
                  "description": "Champions League football matches streaming live"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "SportsEvent",
                  "name": "La Liga Live Streams",
                  "url": "https://damitv.pro/channels",
                  "location": {
                    "@type": "VirtualLocation",
                    "name": "DamiTV"
                  },
                  "description": "Spanish La Liga football streaming online"
                }
              }
            ]
          }
        `}
        </script>
      </Helmet>
      
      {/* Popunder Ad removed */}
      
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">Live TV Channels</h1>
          <Link to="/schedule" className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]">
              <Calendar className="h-4 w-4 mr-2" />
              Full Schedule
            </Button>
          </Link>
        </div>
        <p className="text-gray-300 mb-6">
          Watch international sports channels from around the world with our comprehensive TV guide and live streams.
        </p>
        
        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>
        
        {/* Video Advertisement */}
        <div className="mb-6">
          <Advertisement type="video" className="w-full" />
        </div>
        
        <ChannelsGrid />
        
        {/* Direct Link Advertisement removed */}
        {/* <div className="my-6 sm:my-8">
          <Advertisement type="direct-link" className="w-full" />
        </div> */}
        
        {/* Cross-promotion for News section */}
        <div className="my-8 bg-gradient-to-r from-[#242836] to-[#1A1F2C] rounded-xl p-5 border border-[#343a4d] flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Latest Sports Updates</h3>
            <p className="text-sm text-gray-300">Get breaking news and match reports</p>
          </div>
          <Link to="/news">
            <Button className="bg-[#ff5a36] hover:bg-[#e64d2e]">
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

