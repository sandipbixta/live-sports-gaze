import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import SearchBar from './SearchBar';
import { getChannelsByCountryAsync, Channel } from '@/data/tvChannels';
import { Users, Tv, X, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

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
    setActiveChannel(channel);
  };

  const handleClosePlayer = () => {
    setActiveChannel(null);
  };

  const handleOpenFullscreen = () => {
    if (activeChannel) {
      navigate(`/channel/${activeChannel.countryCode}/${activeChannel.id}`);
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

      {/* Inline Player */}
      {activeChannel && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Player Header */}
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-3">
              {activeChannel.logo && (
                <img 
                  src={activeChannel.logo} 
                  alt={activeChannel.title}
                  className="w-8 h-8 object-contain bg-white rounded p-0.5"
                />
              )}
              <div>
                <h3 className="font-semibold text-foreground text-sm">{activeChannel.title}</h3>
                <p className="text-xs text-muted-foreground">{activeChannel.country}</p>
              </div>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                ● LIVE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenFullscreen}
                className="text-muted-foreground hover:text-foreground"
                title="Open fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePlayer}
                className="text-muted-foreground hover:text-foreground"
                title="Close player"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Video Player */}
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src={activeChannel.embedUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="p-3 bg-muted/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Click another channel to switch or close to browse
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFullscreen}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Full Page
            </Button>
          </div>
        </div>
      )}
      
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
            {filteredChannels.map(channel => {
              const isActive = activeChannel?.id === channel.id;
              return (
                <div
                  key={`${channel.country || selectedCountry}-${channel.id}`}
                  className={`bg-card rounded-xl p-3 cursor-pointer transition-all duration-200 border group relative ${
                    isActive 
                      ? 'border-sports-primary bg-sports-primary/10 ring-2 ring-sports-primary/30' 
                      : 'border-border hover:border-sports-primary hover:bg-accent'
                  }`}
                  onClick={() => handleSelectChannel(channel)}
                >
                  {/* Viewer badge */}
                  {channel.viewers && channel.viewers > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      <Users className="w-2.5 h-2.5" />
                      {channel.viewers}
                    </div>
                  )}
                  
                  {/* Now Playing indicator */}
                  {isActive && (
                    <div className="absolute top-2 left-2 bg-sports-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                      ▶ Playing
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                    {/* Channel Logo */}
                    <div className={`w-14 h-14 rounded-xl mb-2 overflow-hidden flex items-center justify-center bg-white p-1.5 transition-transform shadow-sm ${
                      isActive ? 'scale-105' : 'group-hover:scale-105'
                    }`}>
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
                    <h3 className={`text-xs font-medium transition-colors line-clamp-2 leading-tight ${
                      isActive ? 'text-sports-primary' : 'text-foreground group-hover:text-sports-primary'
                    }`}>
                      {channel.title}
                    </h3>
                    
                    {/* Show country name when searching */}
                    {searchTerm.trim() && channel.country && (
                      <p className="text-[10px] text-muted-foreground mt-1">{channel.country}</p>
                    )}
                  </div>
                </div>
              );
            })}
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
