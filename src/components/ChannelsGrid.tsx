
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChannelCard from './ChannelCard';
import EnhancedChannelCard from './EnhancedChannelCard';
import ModernChannelCard from './ModernChannelCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getChannelsByCountry, getCountries } from '@/data/tvChannels';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tv, Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChannelGuide from './ChannelGuide';
import { iptvOrgService } from '@/services/iptvOrgService';
import { Button } from '@/components/ui/button';
import StreamPlayer from './StreamPlayer';

const ChannelsGrid = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const countries = getCountries();
  const channelsByCountry = getChannelsByCountry();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedChannelUrl, setSelectedChannelUrl] = useState<string | null>(null);
  const [selectedChannelTitle, setSelectedChannelTitle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("channels");
  const [enhancedChannels, setEnhancedChannels] = useState<Record<string, any[]>>({});
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);
  const [useEnhancedView, setUseEnhancedView] = useState(false);
  const [useModernView, setUseModernView] = useState(false); // Set to false to show video player

  // Auto-select channel from URL parameter
  useEffect(() => {
    const channelParam = searchParams.get('channel');
    if (channelParam) {
      // Find the channel across all countries
      let foundChannel = null;
      let foundCountry = null;
      
      for (const [country, channels] of Object.entries(channelsByCountry)) {
        const channel = channels.find(ch => ch.id === channelParam);
        if (channel) {
          foundChannel = channel;
          foundCountry = country;
          break;
        }
      }
      
      if (foundChannel && foundCountry) {
        setSelectedCountry(foundCountry);
        setSelectedChannelUrl(foundChannel.embedUrl);
        setSelectedChannelTitle(foundChannel.title);
      }
    }
  }, [searchParams, channelsByCountry]);

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

  const handleSelectChannel = (channel: any) => {
    setSelectedChannelUrl(channel.embedUrl);
    setSelectedChannelTitle(channel.title);
  };

  const handleRetry = () => {
    // Force reload the current channel
    if (selectedChannelUrl) {
      const currentUrl = selectedChannelUrl;
      setSelectedChannelUrl(null);
      setTimeout(() => setSelectedChannelUrl(currentUrl), 100);
    }
  };

  const currentChannels = useEnhancedView ? 
    (enhancedChannels[selectedCountry] || []) : 
    (channelsByCountry[selectedCountry] || []).map(channel => ({ ...channel, enhanced: false }));

  // Get featured channels (first 4 for the hero section)
  const featuredChannels = currentChannels.slice(0, 4);
  const allChannels = currentChannels;

  // Create stream object for the selected channel
  const selectedStream = selectedChannelUrl ? {
    id: selectedChannelTitle || 'channel',
    streamNo: 1,
    language: 'English',
    hd: true,
    embedUrl: selectedChannelUrl,
    source: 'TV Channel'
  } : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Country Selector and View Toggle */}
      <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm mb-2">Select Country</h3>
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
          
          <div className="flex items-center gap-2">
            {loadingEnhanced && <Loader className="h-4 w-4 animate-spin text-[#ff5a36]" />}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseModernView(!useModernView)}
                className="bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d] text-xs"
              >
                {useModernView ? 'Video View' : 'Grid View'}
              </Button>
              {Object.keys(enhancedChannels).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseEnhancedView(!useEnhancedView)}
                  className="bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d] text-xs"
                >
                  {useEnhancedView ? 'Basic View' : 'Enhanced View'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Channels and TV Guide */}
      <Tabs defaultValue="channels" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-[#242836] border-b border-[#343a4d]">
          <TabsTrigger value="channels" className="data-[state=active]:bg-[#343a4d]">Live Channels</TabsTrigger>
          <TabsTrigger value="guide" className="data-[state=active]:bg-[#343a4d]">TV Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-0">
          {useModernView ? (
            // Modern simplified layout
            <div className="space-y-8">
              {/* All Channels Grid */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">All Channels</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {allChannels.map(channel => (
                    <div
                      key={channel.id}
                      className="bg-[#1a1f2e] rounded-xl p-4 cursor-pointer hover:bg-[#242836] transition-all duration-200 border border-[#343a4d] hover:border-[#ff5a36] group"
                      onClick={() => handleSelectChannel(channel)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-[#343a4d] group-hover:scale-110 transition-transform">
                          {channel.logo ? (
                            <img 
                              src={channel.logo} 
                              alt={channel.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white ${channel.logo ? 'hidden' : ''}`}>
                            {channel.title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('')}
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-white group-hover:text-[#ff5a36] transition-colors">
                          {channel.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Original layout with video player
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
              {/* Video Player */}
              <div className="col-span-1 lg:col-span-3 bg-[#151922] rounded-xl overflow-hidden order-1 lg:order-1">
                {selectedChannelUrl ? (
                  <div>
                    <StreamPlayer
                      stream={selectedStream}
                      isLoading={false}
                      onRetry={handleRetry}
                    />
                    {selectedChannelTitle && (
                      <div className="p-4 border-t border-[#343a4d]">
                        <h3 className="text-lg font-semibold text-white">{selectedChannelTitle}</h3>
                        <p className="text-gray-400 text-sm">Live Sports Channel</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px] sm:min-h-[400px]">
                    <div className="text-center p-4">
                      <div className="mx-auto w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#242836] flex items-center justify-center mb-2 sm:mb-4">
                        <Tv className="h-5 w-5 sm:h-8 sm:w-8 text-[#fa2d04]" />
                      </div>
                      <h3 className="text-base sm:text-xl font-semibold text-white">Select a Channel</h3>
                      <p className="text-gray-400 mt-1 text-xs sm:text-base">Choose a sports channel to watch</p>
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
                    {currentChannels.map(channel => (
                      useEnhancedView && channel.enhanced ? (
                        <EnhancedChannelCard
                          key={channel.id}
                          title={channel.title}
                          embedUrl={channel.embedUrl}
                          logo={channel.logo}
                          website={channel.website}
                          network={channel.network}
                          categories={channel.categories}
                          onClick={() => handleSelectChannel(channel)}
                          isActive={selectedChannelUrl === channel.embedUrl}
                        />
                      ) : (
                        <ChannelCard
                          key={channel.id}
                          title={channel.title}
                          embedUrl={channel.embedUrl}
                          logo={channel.logo}
                          onClick={() => handleSelectChannel(channel)}
                          isActive={selectedChannelUrl === channel.embedUrl}
                        />
                      )
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="guide" className="mt-0">
          <ChannelGuide selectedCountry={selectedCountry} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelsGrid;
