
import React, { useState } from 'react';
import { tvChannels } from '../data/tvChannels';
import ChannelCard from './ChannelCard';
import { AspectRatio } from './ui/aspect-ratio';
import { Tv, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const FeaturedChannels = () => {
  const [selectedChannelUrl, setSelectedChannelUrl] = useState<string | null>(null);
  const [selectedChannelTitle, setSelectedChannelTitle] = useState<string | null>(null);

  // Get featured channels - mix of popular UK, US, and other channels
  const featuredChannels = [
    tvChannels.find(ch => ch.id === 'sky-sports-news'),
    tvChannels.find(ch => ch.id === 'sky-sports-premier-league'),
    tvChannels.find(ch => ch.id === 'espn-usa'),
    tvChannels.find(ch => ch.id === 'fox-sports1-usa'),
    tvChannels.find(ch => ch.id === 'tnt-sports-1'),
    tvChannels.find(ch => ch.id === 'star-sports1-india'),
    tvChannels.find(ch => ch.id === 'bein-sport1-france'),
    tvChannels.find(ch => ch.id === 'fox-501'),
  ].filter(Boolean).slice(0, 8);

  const handleSelectChannel = (embedUrl: string, title: string) => {
    setSelectedChannelUrl(embedUrl);
    setSelectedChannelTitle(title);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Live TV Channels</h2>
        <Link to="/channels">
          <Button variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent">
            View All Channels <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
        {/* Video player */}
        <div className="col-span-1 lg:col-span-3 bg-[#151922] rounded-xl overflow-hidden">
          {selectedChannelUrl ? (
            <>
              <div className="relative w-full bg-[#151922]">
                <AspectRatio ratio={16/9}>
                  <iframe 
                    src={selectedChannelUrl}
                    className="w-full h-full"
                    title={selectedChannelTitle || "Live Channel"}
                    frameBorder="0"
                    allowFullScreen 
                    allow="encrypted-media; picture-in-picture;"
                  ></iframe>
                </AspectRatio>
              </div>
              <div className="p-4 border-t border-[#343a4d]">
                <h3 className="text-lg font-semibold text-white">{selectedChannelTitle}</h3>
                <p className="text-gray-400 text-sm">Live TV Stream</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center p-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#242836] flex items-center justify-center mb-4">
                  <Tv className="h-8 w-8 text-[#ff5a36]" />
                </div>
                <h3 className="text-xl font-semibold text-white">Select a Live Channel</h3>
                <p className="text-gray-400 mt-1">Choose from our featured channels to start watching</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Channel list */}
        <div className="col-span-1 bg-[#151922] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#343a4d]">
            <h3 className="font-semibold text-white">Featured Channels</h3>
          </div>
          
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
            {featuredChannels.map(channel => (
              <ChannelCard
                key={channel.id}
                title={channel.title}
                embedUrl={channel.embedUrl}
                logo={channel.logo}
                onClick={() => handleSelectChannel(channel.embedUrl, channel.title)}
                isActive={selectedChannelUrl === channel.embedUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedChannels;
