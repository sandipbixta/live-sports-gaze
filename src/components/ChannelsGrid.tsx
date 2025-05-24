import React, { useState, useEffect } from 'react';
import ChannelCard from './ChannelCard';
import EnhancedChannelCard from './EnhancedChannelCard';
import Advertisement from './Advertisement';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChannelsByCountry, getCountries } from '@/data/tvChannels';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tv, Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iptvOrgService } from '@/services/iptvOrgService';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '../hooks/use-mobile';

const ChannelsGrid = () => {
  const countries = getCountries();
  const channelsByCountry = getChannelsByCountry();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedChannelUrl, setSelectedChannelUrl] = useState<string | null>(null);
  const [selectedChannelTitle, setSelectedChannelTitle] = useState<string | null>(null);
  const [enhancedChannels, setEnhancedChannels] = useState<Record<string, any[]>>({});
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);
  const [useEnhancedView, setUseEnhancedView] = useState(false);
  const isMobile = useIsMobile();

  // Load enhanced channel data
  useEffect(() => {
    const loadEnhancedChannels = async () => {
      setLoadingEnhanced(true);
      try {
        console.log('Loading enhanced channel data from IPTV-ORG...');
        const iptvChannelsByCountry = await iptvOrgService.getChannelsForOurCountries();
        
        // Convert to our format and merge with existing data
        const enhanced: Record<string, any[]> = {};
        
        Object.keys(channelsByCountry).forEach(country => {
          const existingChannels = channelsByCountry[country];
          const iptvChannels = iptvChannelsByCountry[country] || [];
          
          // Convert IPTV channels to our format
          const convertedChannels = iptvChannels.map(iptvChannel => 
            iptvOrgService.convertToOurFormat(iptvChannel, country)
          );
          
          // Merge existing channels with enhanced data
          enhanced[country] = [
            ...existingChannels.map(channel => ({
              ...channel,
              enhanced: false
            })),
            ...convertedChannels.map(channel => ({
              ...channel,
              enhanced: true
            }))
          ];
        });
        
        setEnhancedChannels(enhanced);
        console.log('Enhanced channel data loaded:', enhanced);
      } catch (error) {
        console.error('Failed to load enhanced channels:', error);
        // Fall back to original data
        const fallback: Record<string, any[]> = {};
        Object.keys(channelsByCountry).forEach(country => {
          fallback[country] = channelsByCountry[country].map(channel => ({
            ...channel,
            enhanced: false
          }));
        });
        setEnhancedChannels(fallback);
      } finally {
        setLoadingEnhanced(false);
      }
    };

    loadEnhancedChannels();
  }, []);

  const handleSelectChannel = (embedUrl: string, title: string) => {
    setSelectedChannelUrl(embedUrl);
    setSelectedChannelTitle(title);
  };

  const currentChannels = useEnhancedView ? 
    (enhancedChannels[selectedCountry] || []) : 
    (channelsByCountry[selectedCountry] || []).map(channel => ({ ...channel, enhanced: false }));

  return (
    <div className="flex flex-col gap-4">
      {/* Country Selector */}
      <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-white text-sm">Select Country</h3>
          {Object.keys(enhancedChannels).length > 0 && (
            <div className="flex items-center gap-2">
              {loadingEnhanced && <Loader className="h-4 w-4 animate-spin text-[#ff5a36]" />}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseEnhancedView(!useEnhancedView)}
                className="bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d] text-xs"
              >
                {useEnhancedView ? 'Basic View' : 'Enhanced View'}
              </Button>
            </div>
          )}
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-full bg-[#242836] border-[#343a4d] text-white text-xs sm:text-sm">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="bg-[#242836] border-[#343a4d] text-white">
            {countries.map(country => (
              <SelectItem key={country} value={country}>
                {country} {useEnhancedView && enhancedChannels[country] && 
                  `(${enhancedChannels[country].length} channels)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Live Channels Section */}
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
            <h3 className="font-semibold text-white mb-2 text-sm">
              Live Sports Channels 
              {useEnhancedView && (
                <span className="text-xs text-gray-400 ml-1">
                  (Enhanced with IPTV-ORG)
                </span>
              )}
            </h3>
          </div>
          
          <ScrollArea className="h-[200px] sm:h-[600px] px-2 sm:px-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 gap-1 sm:gap-2">
              {currentChannels.map((channel, index) => (
                <React.Fragment key={channel.id}>
                  {useEnhancedView && channel.enhanced ? (
                    <EnhancedChannelCard
                      title={channel.title}
                      embedUrl={channel.embedUrl}
                      logo={channel.logo}
                      website={channel.website}
                      network={channel.network}
                      categories={channel.categories}
                      onClick={() => handleSelectChannel(channel.embedUrl, channel.title)}
                      isActive={selectedChannelUrl === channel.embedUrl}
                    />
                  ) : (
                    <ChannelCard
                      title={channel.title}
                      embedUrl={channel.embedUrl}
                      onClick={() => handleSelectChannel(channel.embedUrl, channel.title)}
                      isActive={selectedChannelUrl === channel.embedUrl}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ChannelsGrid;
