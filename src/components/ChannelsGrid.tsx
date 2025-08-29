
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import SearchBar from './SearchBar';
import { getChannelsByCountry, getAllChannelSources } from '@/data/tvChannels';
import { iptvProviderService } from '@/services/iptvProviderService';

// Helper for channel initials
const getInitials = (title: string) =>
  title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');

const ChannelsGrid = () => {
  const navigate = useNavigate();
  const channelsByCountry = getChannelsByCountry();
  const allCountryNames = Object.keys(channelsByCountry);
  // Default to first country alphabetical if exists
  const [selectedCountry, setSelectedCountry] = useState(allCountryNames[0] || "");
  const [searchTerm, setSearchTerm] = useState('');
  const [iptvChannels, setIptvChannels] = useState<Record<string, any[]>>({});
  const [showIptvChannels, setShowIptvChannels] = useState(false);
  const [isLoadingIptv, setIsLoadingIptv] = useState(false);

  // Load IPTV channels on mount
  useEffect(() => {
    const loadIptvChannels = async () => {
      try {
        setIsLoadingIptv(true);
        // Clear cache first to ensure fresh data
        iptvProviderService.clearCache();
        console.log('🔄 Refreshing IPTV channels...');
        
        const channels = await getAllChannelSources();
        setIptvChannels(channels);
        console.log('IPTV channels loaded:', channels);
      } catch (error) {
        console.error('Error loading IPTV channels:', error);
      } finally {
        setIsLoadingIptv(false);
      }
    };

    loadIptvChannels();
  }, []);

  const handleSelectChannel = (channel: any, country: string) => {
    if (showIptvChannels && channel.provider) {
      // Check if it's a Xtream channel
      const isXtreamChannel = channel.id?.startsWith('xtream-');
      const route = isXtreamChannel 
        ? `/xtream/${encodeURIComponent(channel.provider)}/${encodeURIComponent(channel.id)}`
        : `/iptv/${encodeURIComponent(channel.provider)}/${encodeURIComponent(channel.id)}`;
      navigate(route);
    } else {
      // Navigate to regular channel player
      navigate(`/channel/${country}/${channel.id}`);
    }
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter channels based on search term
  const filteredChannels = useMemo(() => {
    if (showIptvChannels) {
      // Show IPTV channels
      let allIptvChannels: any[] = [];
      Object.entries(iptvChannels).forEach(([provider, channels]) => {
        channels.forEach((channel: any) => {
          allIptvChannels.push({ ...channel, provider, country: channel.country || provider });
        });
      });

      if (searchTerm.trim()) {
        allIptvChannels = allIptvChannels.filter(channel =>
          channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          channel.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (channel.provider && channel.provider.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return allIptvChannels;
    } else {
      // Show regular built-in channels
      if (!searchTerm.trim()) {
        return selectedCountry ? (channelsByCountry[selectedCountry] || []) : [];
      }

      // Search across all countries when there's a search term
      const allChannels: any[] = [];
      Object.entries(channelsByCountry).forEach(([country, channels]) => {
        channels.forEach((channel: any) => {
          if (channel.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            allChannels.push({ ...channel, country });
          }
        });
      });
      return allChannels;
    }
  }, [searchTerm, selectedCountry, channelsByCountry, showIptvChannels, iptvChannels]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-white">
          {showIptvChannels ? 'IPTV Channels' : 'All Channels by Country'}
        </h2>
        <button
          onClick={() => setShowIptvChannels(!showIptvChannels)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showIptvChannels
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          disabled={isLoadingIptv}
        >
          {isLoadingIptv ? 'Loading...' : showIptvChannels ? 'Show Built-in' : 'Show IPTV'}
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="bg-[#1a1f2e] rounded-xl border border-[#343a4d] p-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={showIptvChannels ? "Search IPTV channels..." : "Search channels..."}
          className="w-full"
        />
      </div>

      {/* IPTV Status */}
      {showIptvChannels && Object.keys(iptvChannels).length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-white">IPTV Sources Available:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(iptvChannels).map(([provider, channels]) => (
              <span key={provider} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {provider} ({channels.length} channels)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Country Selector - only show when not searching and not showing IPTV */}
      {!searchTerm.trim() && !showIptvChannels && (
        <CountrySelector
          countries={allCountryNames}
          selected={selectedCountry}
          onSelect={handleSelectCountry}
        />
      )}

      {/* Channels Display */}
      {(searchTerm.trim() || selectedCountry || showIptvChannels) && (
        <div className="bg-[#151922] rounded-xl border border-[#343a4d] p-4">
          <h3 className="font-semibold text-white text-lg mb-2">
            {searchTerm.trim() 
              ? `Search Results for "${searchTerm}" (${filteredChannels.length} channels)`
              : showIptvChannels
                ? `IPTV Channels (${filteredChannels.length} available)`
                : selectedCountry
            }
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredChannels.map(channel => (
              <div
                key={`${channel.country || selectedCountry}-${channel.id}`}
                className="bg-[#1a1f2e] rounded-xl p-4 cursor-pointer hover:bg-[#242836] transition-all duration-200 border border-[#343a4d] hover:border-[#ff5a36] group"
                onClick={() => handleSelectChannel(channel, channel.country || selectedCountry)}
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
                      {getInitials(channel.title)}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-white group-hover:text-[#ff5a36] transition-colors">
                    {channel.title}
                  </h3>
                   {/* Show country/provider name when searching or showing IPTV */}
                  {(searchTerm.trim() || showIptvChannels) && channel.country && (
                    <p className="text-xs text-gray-400 mt-1">
                      {showIptvChannels && channel.provider ? `${channel.provider} - ${channel.country}` : channel.country}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filteredChannels.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchTerm.trim() 
                  ? "No channels found matching your search."
                  : "No channels available for this country."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelsGrid;
