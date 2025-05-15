
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChannelCard from './ChannelCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChannelsByCountry, getCountries } from '@/data/tvChannels';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tv } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ChannelsGrid = () => {
  const countries = getCountries();
  const channelsByCountry = getChannelsByCountry();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedChannelUrl, setSelectedChannelUrl] = useState<string | null>(null);
  const [selectedChannelTitle, setSelectedChannelTitle] = useState<string | null>(null);

  const handleSelectChannel = (embedUrl: string, title: string) => {
    setSelectedChannelUrl(embedUrl);
    setSelectedChannelTitle(title);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
      {/* Video player - moved to top on mobile */}
      <div className="col-span-1 lg:col-span-3 bg-[#151922] rounded-xl overflow-hidden order-1 lg:order-1">
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
            <div className="p-2 sm:p-4 border-t border-[#343a4d]">
              <h3 className="text-sm sm:text-lg font-semibold text-white">{selectedChannelTitle}</h3>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] sm:min-h-[400px]">
            <div className="text-center p-4">
              <div className="mx-auto w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#242836] flex items-center justify-center mb-2 sm:mb-4">
                <Tv className="h-5 w-5 sm:h-8 sm:w-8 text-[#fa2d04]" />
              </div>
              <h3 className="text-base sm:text-xl font-semibold text-white">Select a Channel</h3>
              <p className="text-gray-400 mt-1 text-xs sm:text-base">Choose a sports channel from the list</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Channel list */}
      <div className="col-span-1 bg-[#151922] rounded-xl overflow-hidden order-2 lg:order-2">
        <div className="p-2 sm:p-4 border-b border-[#343a4d]">
          <h3 className="font-semibold text-white mb-2 text-sm">Live Sports Channels</h3>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full bg-[#242836] border-[#343a4d] text-white text-xs sm:text-sm">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-[#242836] border-[#343a4d] text-white">
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <ScrollArea className="h-[200px] sm:h-[600px] px-2 sm:px-4 py-2 sm:py-4">
          <div className="grid grid-cols-1 gap-1 sm:gap-2">
            {channelsByCountry[selectedCountry]?.map(channel => (
              <ChannelCard
                key={channel.id}
                title={channel.title}
                embedUrl={channel.embedUrl}
                onClick={() => handleSelectChannel(channel.embedUrl, channel.title)}
                isActive={selectedChannelUrl === channel.embedUrl}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChannelsGrid;
