
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import ChannelCard from './ChannelCard';

interface RecentChannel {
  id: string;
  title: string;
  embedUrl: string;
  watchedAt: Date;
}

interface RecentlyWatchedChannelsProps {
  onSelectChannel: (embedUrl: string, title: string) => void;
}

const RecentlyWatchedChannels: React.FC<RecentlyWatchedChannelsProps> = ({ onSelectChannel }) => {
  const [recentChannels, setRecentChannels] = useState<RecentChannel[]>([]);

  useEffect(() => {
    // Load recent channels from localStorage
    const stored = localStorage.getItem('recentChannels');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentChannels(parsed.map((ch: any) => ({
          ...ch,
          watchedAt: new Date(ch.watchedAt)
        })));
      } catch (error) {
        console.error('Failed to parse recent channels:', error);
      }
    }
  }, []);

  const addRecentChannel = (title: string, embedUrl: string) => {
    const newChannel: RecentChannel = {
      id: Date.now().toString(),
      title,
      embedUrl,
      watchedAt: new Date()
    };

    const updatedChannels = [newChannel, ...recentChannels.filter(ch => ch.embedUrl !== embedUrl)]
      .slice(0, 5); // Keep only 5 recent channels

    setRecentChannels(updatedChannels);
    localStorage.setItem('recentChannels', JSON.stringify(updatedChannels));
  };

  const removeRecentChannel = (id: string) => {
    const updatedChannels = recentChannels.filter(ch => ch.id !== id);
    setRecentChannels(updatedChannels);
    localStorage.setItem('recentChannels', JSON.stringify(updatedChannels));
  };

  const clearAllRecent = () => {
    setRecentChannels([]);
    localStorage.removeItem('recentChannels');
  };

  // Expose addRecentChannel to parent component
  React.useEffect(() => {
    (window as any).addRecentChannel = addRecentChannel;
  }, [recentChannels]);

  if (recentChannels.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d] mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#ff5a36]" />
          <h3 className="font-semibold text-white text-sm">Recently Watched</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllRecent}
          className="text-gray-400 hover:text-white text-xs"
        >
          Clear All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {recentChannels.map(channel => (
          <div key={channel.id} className="flex items-center gap-2">
            <div className="flex-1">
              <ChannelCard
                title={channel.title}
                embedUrl={channel.embedUrl}
                onClick={() => onSelectChannel(channel.embedUrl, channel.title)}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRecentChannel(channel.id)}
              className="text-gray-400 hover:text-red-400 p-1 h-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyWatchedChannels;
