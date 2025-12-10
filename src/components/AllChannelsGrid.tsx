import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchChannelsFromAPI, Channel } from '../data/tvChannels';
import { Tv, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

// Helper for channel initials
const getInitials = (title: string) =>
  title.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');

// Define channel categories
const CHANNEL_CATEGORIES = [
  { id: 'all', label: 'All Channels' },
  { id: 'sports', label: 'Sports' },
  { id: 'football', label: 'Football' },
  { id: 'news', label: 'News' },
  { id: 'entertainment', label: 'Entertainment' },
];

// Keywords for categorizing channels
const categoryKeywords: Record<string, string[]> = {
  sports: ['sport', 'espn', 'sky sport', 'bt sport', 'bein', 'fox sport', 'eurosport', 'dazn', 'supersport', 'star sport', 'sony', 'arena', 'stadium', 'match'],
  football: ['football', 'soccer', 'premier', 'laliga', 'bundesliga', 'serie a', 'ligue', 'champions', 'uefa', 'fifa'],
  news: ['news', 'cnn', 'bbc', 'sky news', 'al jazeera', 'france 24', 'euronews', 'rt'],
  entertainment: ['hbo', 'netflix', 'movie', 'cinema', 'film', 'mtv', 'vh1', 'comedy', 'drama'],
};

const AllChannelsGrid: React.FC = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const allChannels = await fetchChannelsFromAPI();
        setChannels(allChannels);
      } catch (error) {
        console.error('Failed to load channels:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChannels();
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    navigate(`/channel/${channel.countryCode || channel.country}/${channel.id}`);
  };

  // Filter channels by category
  const filteredChannels = useMemo(() => {
    if (selectedCategory === 'all') {
      return channels;
    }
    
    const keywords = categoryKeywords[selectedCategory] || [];
    return channels.filter(channel => {
      const title = channel.title.toLowerCase();
      return keywords.some(keyword => title.includes(keyword));
    });
  }, [channels, selectedCategory]);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Live TV Channels</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Live TV Channels</h2>
        <Link to="/channels">
          <Button variant="outline" size="sm" className="rounded-full">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {CHANNEL_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-sports-primary text-white'
                : 'bg-card text-muted-foreground hover:bg-accent border border-border'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filteredChannels.slice(0, 48).map(channel => (
          <div
            key={channel.id}
            className="bg-card rounded-xl p-2 cursor-pointer transition-all duration-200 border group relative border-border hover:border-sports-primary hover:bg-accent aspect-square flex flex-col items-center justify-center"
            onClick={() => handleSelectChannel(channel)}
          >
            {/* Channel Logo */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg mb-2 overflow-hidden flex items-center justify-center bg-muted p-1.5 transition-transform group-hover:scale-105">
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
                  <div className="hidden w-full h-full flex items-center justify-center">
                    <Tv className="w-4 h-4 text-muted-foreground" />
                  </div>
                </>
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground">
                  {getInitials(channel.title)}
                </span>
              )}
            </div>
            
            {/* Channel Name */}
            <h3 className="text-[9px] sm:text-[10px] font-medium line-clamp-2 leading-tight text-foreground group-hover:text-sports-primary text-center px-0.5">
              {channel.title}
            </h3>
          </div>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-8 bg-card rounded-xl border border-border">
          <Tv className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No channels found in this category.</p>
        </div>
      )}

      {filteredChannels.length > 48 && (
        <div className="text-center mt-4">
          <Link to="/channels">
            <Button variant="outline" className="rounded-full">
              View All {filteredChannels.length} Channels <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllChannelsGrid;
