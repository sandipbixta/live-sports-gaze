import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import SearchBar from './SearchBar';
import { getChannelsByCountryAsync, Channel } from '@/data/tvChannels';
import { Users, Tv } from 'lucide-react';

// Helper for channel initials
const getInitials = (title: string) =>
  title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');

const ChannelsGrid = () => {
  const navigate = useNavigate();
  const [channelsByCountry, setChannelsByCountry] = useState<Record<string, Channel[]>>({});
  const [allCountryNames, setAllCountryNames] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch channels on mount
  useEffect(() => {
    const loadChannels = async () => {
      setLoading(true);
      try {
        const channels = await getChannelsByCountryAsync();
        setChannelsByCountry(channels);
        const countries = Object.keys(channels).sort();
        setAllCountryNames(countries);
        if (countries.length > 0 && !selectedCountry) {
          setSelectedCountry(countries[0]);
        }
      } catch (error) {
        console.error('Failed to load channels:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChannels();
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    navigate(`/channel/${channel.countryCode}/${channel.id}`);
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
    const allChannels: Channel[] = [];
    Object.entries(channelsByCountry).forEach(([country, channels]) => {
      channels.forEach((channel) => {
        if (channel.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          allChannels.push({ ...channel, country });
        }
      });
    });
    return allChannels;
  }, [searchTerm, selectedCountry, channelsByCountry]);

  // Get total channel count
  const totalChannels = useMemo(() => {
    return Object.values(channelsByCountry).reduce((sum, channels) => sum + channels.length, 0);
  }, [channelsByCountry]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">All Channels by Country</h2>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sports-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (allCountryNames.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">All Channels by Country</h2>
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No channels available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">All Channels by Country</h2>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {totalChannels} channels
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-xl border border-border p-4">
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
        <div className="bg-card/50 rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground text-lg mb-4">
            {searchTerm.trim() 
              ? `Search Results for "${searchTerm}" (${filteredChannels.length} channels)`
              : `${selectedCountry} (${filteredChannels.length} channels)`
            }
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredChannels.map(channel => (
              <div
                key={`${channel.country || selectedCountry}-${channel.id}`}
                className="bg-card rounded-xl p-3 cursor-pointer transition-all duration-200 border group relative border-border hover:border-sports-primary hover:bg-accent"
                onClick={() => handleSelectChannel(channel)}
              >
                {/* Viewer badge */}
                {channel.viewers && channel.viewers > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    <Users className="w-2.5 h-2.5" />
                    {channel.viewers}
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  {/* Channel Logo */}
                  <div className="w-14 h-14 rounded-xl mb-2 overflow-hidden flex items-center justify-center bg-gray-200 p-1.5 transition-transform shadow-sm group-hover:scale-105">
                    {channel.logo ? (
                      <>
                        <img
                          src={channel.logo}
                          alt={channel.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center bg-muted rounded-lg">
                          <Tv className="w-6 h-6 text-muted-foreground" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                        <span className="text-sm font-bold text-muted-foreground">
                          {getInitials(channel.title)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Channel Name */}
                  <h3 className="text-xs font-medium transition-colors line-clamp-2 leading-tight text-foreground group-hover:text-sports-primary">
                    {channel.title}
                  </h3>
                  
                  {/* Show country name when searching */}
                  {searchTerm.trim() && channel.country && (
                    <p className="text-[10px] text-muted-foreground mt-1">{channel.country}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filteredChannels.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
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
