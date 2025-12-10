import React, { useState, useEffect } from 'react';
import { fetchChannelsFromAPI, Channel } from '../data/tvChannels';
import { ArrowRight, Tv, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router-dom';

// Helper for channel initials
const getInitials = (title: string) =>
  title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');

interface FeaturedChannelsProps {
  maxChannels?: number;
  showAll?: boolean;
}

const FeaturedChannels: React.FC<FeaturedChannelsProps> = ({ 
  maxChannels = 24,
  showAll = false 
}) => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const allChannels = await fetchChannelsFromAPI();
        // Filter for sports channels or show all if showAll is true
        const displayChannels = showAll ? allChannels : allChannels.slice(0, maxChannels);
        setChannels(displayChannels);
      } catch (error) {
        console.error('Failed to load featured channels:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChannels();
  }, [maxChannels, showAll]);

  const handleSelectChannel = (channel: Channel) => {
    navigate(`/channel/${channel.countryCode || channel.country}/${channel.id}`);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">Live TV Channels</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <div key={i} className="aspect-square bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">Live TV Channels</h2>
          <Link to="/channels">
            <Button variant="outline" className="backdrop-blur-md shadow-lg rounded-full">
              View All Channels <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">No channels available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Live TV Channels</h2>
        <Link to="/channels">
          <Button variant="outline" className="backdrop-blur-md shadow-lg rounded-full">
            View All Channels <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {channels.map(channel => (
          <div
            key={channel.id}
            className="bg-card rounded-xl p-2 cursor-pointer transition-all duration-200 border group relative border-border hover:border-sports-primary hover:bg-accent aspect-square flex flex-col items-center justify-center"
            onClick={() => handleSelectChannel(channel)}
          >
            {/* Channel Logo */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-1.5 overflow-hidden flex items-center justify-center bg-muted p-1 transition-transform shadow-sm group-hover:scale-105">
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
                    <Tv className="w-5 h-5 text-muted-foreground" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                  <span className="text-xs font-bold text-muted-foreground">
                    {getInitials(channel.title)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Channel Name */}
            <h3 className="text-[10px] sm:text-xs font-medium transition-colors line-clamp-2 leading-tight text-foreground group-hover:text-sports-primary text-center px-1">
              {channel.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedChannels;
