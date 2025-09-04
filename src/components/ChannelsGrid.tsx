
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import SearchBar from './SearchBar';
import { getChannelsByCountry } from '@/data/tvChannels';
import { channelLogoService } from '@/services/channelLogoService';

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

  const handleSelectChannel = (channel: any, country: string) => {
    navigate(`/channel/${country}/${channel.id}`);
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter channels based on search term
  const filteredChannels = useMemo(() => {
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
  }, [searchTerm, selectedCountry, channelsByCountry]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-white mb-2">All Channels by Country</h2>
      
      {/* Search Bar */}
      <div className="bg-[#1a1f2e] rounded-xl border border-[#343a4d] p-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search channels..."
          className="w-full"
        />
      </div>

      {/* Country Selector - only show when not searching */}
      {!searchTerm.trim() && (
        <CountrySelector
          countries={allCountryNames}
          selected={selectedCountry}
          onSelect={handleSelectCountry}
        />
      )}

      {/* Channels Display */}
      {(searchTerm.trim() || selectedCountry) && (
        <div className="bg-[#151922] rounded-xl border border-[#343a4d] p-4">
          <h3 className="font-semibold text-white text-lg mb-2">
            {searchTerm.trim() 
              ? `Search Results for "${searchTerm}" (${filteredChannels.length} channels)`
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
                    <img
                      src={channel.logo || channelLogoService.getChannelLogoWithFallback(channel.title, channel.id)}
                      alt={channel.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-xs font-bold text-white">
                      {getInitials(channel.title)}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-white group-hover:text-[#ff5a36] transition-colors">
                    {channel.title}
                  </h3>
                  {/* Show country name when searching */}
                  {searchTerm.trim() && channel.country && (
                    <p className="text-xs text-gray-400 mt-1">{channel.country}</p>
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
