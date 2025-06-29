
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import { getChannelsByCountry } from '@/data/tvChannels';

// Helper for channel initials
const getInitials = (title: string) =>
  title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');

interface ChannelsGridProps {
  selectedCountryFromState?: string;
  searchTerm?: string;
}

const ChannelsGrid: React.FC<ChannelsGridProps> = ({ selectedCountryFromState, searchTerm = '' }) => {
  const navigate = useNavigate();
  const channelsByCountry = getChannelsByCountry();
  const allCountryNames = Object.keys(channelsByCountry);
  
  // Use the country from navigation state if available, otherwise default to first country
  const defaultCountry = selectedCountryFromState && allCountryNames.includes(selectedCountryFromState) 
    ? selectedCountryFromState 
    : allCountryNames[0] || "";
    
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  // Update selected country when selectedCountryFromState changes
  useEffect(() => {
    if (selectedCountryFromState && allCountryNames.includes(selectedCountryFromState)) {
      setSelectedCountry(selectedCountryFromState);
    }
  }, [selectedCountryFromState, allCountryNames]);

  const handleSelectChannel = (channel: any, country: string) => {
    navigate(`/channel/${country}/${channel.id}`);
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
  };

  // Filter channels based on search term
  const getFilteredChannels = () => {
    if (!searchTerm.trim()) {
      return selectedCountry ? (channelsByCountry[selectedCountry] || []) : [];
    }

    // If searching, search across all countries
    const allChannels: any[] = [];
    Object.entries(channelsByCountry).forEach(([country, channels]) => {
      channels.forEach((channel: any) => {
        if (channel.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          allChannels.push({ ...channel, country });
        }
      });
    });
    return allChannels;
  };

  const displayChannels = getFilteredChannels();
  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-white mb-4">All Channels by Country</h2>
      
      {/* Only show country selector when not searching */}
      {!isSearching && (
        <CountrySelector
          countries={allCountryNames}
          selected={selectedCountry}
          onSelect={handleSelectCountry}
        />
      )}

      {/* Show search results or selected country */}
      <div className="bg-[#151922] rounded-xl border border-[#343a4d] p-4">
        <h3 className="font-semibold text-white text-lg mb-2">
          {isSearching 
            ? `Search Results for "${searchTerm}" (${displayChannels.length} channels)` 
            : selectedCountry
          }
        </h3>
        
        {displayChannels.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            {isSearching ? 'No channels found matching your search.' : 'No channels available.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayChannels.map((channel, index) => (
              <div
                key={`${channel.country || selectedCountry}-${channel.id}-${index}`}
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
                  {isSearching && channel.country && (
                    <span className="text-xs text-gray-400 mt-1">{channel.country}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsGrid;
