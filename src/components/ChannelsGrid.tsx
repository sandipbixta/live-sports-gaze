import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import SearchBar from './SearchBar';
import { getChannelsByCountryAsync, Channel } from '@/data/tvChannels';
import { Users, Tv, X, Maximize2, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ChannelPlayerSelector, { PlayerType } from '@/components/StreamPlayer/ChannelPlayerSelector';

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
  const [playerType, setPlayerType] = useState<PlayerType>('simple');
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);

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

  const handleRetry = () => {
    if (!activeChannel) return;
    const temp = activeChannel;
    setActiveChannel(null);
    setTimeout(() => setActiveChannel(temp), 100);
  };

  // Get other channels from same country for sidebar
  const otherChannels = useMemo(() => {
    if (!activeChannel) return [];
    const countryChannels = channelsByCountry[activeChannel.country || selectedCountry] || [];
    return countryChannels.filter(ch => ch.id !== activeChannel.id).slice(0, 15);
  }, [activeChannel, channelsByCountry, selectedCountry]);

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

      {/* Inline Player with ChannelPlayerSelector */}
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
              <Badge className="bg-red-500 text-white text-[10px]">● LIVE</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlayerSettings(!showPlayerSettings)}
                className="text-muted-foreground hover:text-foreground"
                title="Player settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
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

          {/* Player Settings Panel */}
          {showPlayerSettings && (
            <div className="p-3 bg-muted/30 border-b border-border">
              <h4 className="text-foreground font-semibold text-sm mb-2">Video Player Settings</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { type: 'simple' as PlayerType, name: 'Smart Player', desc: 'Best option' },
                  { type: 'iframe' as PlayerType, name: 'Direct Embed', desc: 'Provider controls' },
                  { type: 'custom' as PlayerType, name: 'Custom Overlay', desc: 'Visual controls' },
                  { type: 'basic' as PlayerType, name: 'Basic Player', desc: 'Simple fallback' },
                  { type: 'extracted' as PlayerType, name: 'Stream Extractor', desc: 'Advanced' },
                  { type: 'html5' as PlayerType, name: 'HTML5 Player', desc: 'Direct streams' }
                ].map((player) => (
                  <button
                    key={player.type}
                    onClick={() => setPlayerType(player.type)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      playerType === player.type
                        ? 'bg-sports-primary border-sports-primary text-white'
                        : 'bg-muted border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium text-xs">{player.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{player.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Player Area */}
          <div className="flex flex-col lg:flex-row">
            {/* Video Player */}
            <div className="flex-1">
              <ChannelPlayerSelector
                stream={{
                  id: activeChannel.id,
                  streamNo: 1,
                  language: 'English',
                  hd: true,
                  embedUrl: activeChannel.embedUrl,
                  source: 'TV Channel'
                }}
                isLoading={false}
                onRetry={handleRetry}
                playerType={playerType}
                title={activeChannel.title}
              />
            </div>

            {/* Other Channels Sidebar */}
            {otherChannels.length > 0 && (
              <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border">
                <div className="p-3 border-b border-border bg-muted/30">
                  <h4 className="font-semibold text-foreground text-sm">Other Channels</h4>
                  <p className="text-[10px] text-muted-foreground">Click to switch</p>
                </div>
                <ScrollArea className="h-48 lg:h-[300px]">
                  <div className="p-2">
                    {otherChannels.map(otherChannel => (
                      <div
                        key={otherChannel.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                        onClick={() => handleSelectChannel(otherChannel)}
                      >
                        <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-0.5">
                          {otherChannel.logo ? (
                            <img 
                              src={otherChannel.logo} 
                              alt={otherChannel.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Tv className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-medium text-foreground truncate group-hover:text-sports-primary transition-colors">
                            {otherChannel.title}
                          </h5>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-sports-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
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
