
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tv, Play, Clock } from 'lucide-react';
import { getChannelsByCountry } from '@/data/tvChannels';
import { useNavigate } from 'react-router-dom';

interface LiveChannel {
  id: string;
  title: string;
  embedUrl: string;
  logo?: string;
  category: string;
  currentShow: string;
}

interface LiveGamesWidgetProps {
  className?: string;
}

const LiveGamesWidget: React.FC<LiveGamesWidgetProps> = ({ className = '' }) => {
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Generate current show titles based on channel names and time
  const generateCurrentShow = (channelTitle: string): string => {
    const shows = [
      'Champions League Live',
      'Premier League Match',
      'La Liga Football',
      'UEFA Europa League',
      'Serie A Live',
      'Bundesliga Action',
      'Ligue 1 Football',
      'International Football',
      'Sports Center Live',
      'Football Tonight'
    ];
    
    // Use channel title to consistently pick a show
    const hash = channelTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return shows[hash % shows.length];
  };

  // Check if a channel is likely showing live sports content
  const isChannelLive = (channel: any): boolean => {
    const sportsKeywords = ['sport', 'football', 'soccer', 'espn', 'sky', 'bein', 'fox', 'premier', 'champions'];
    const title = channel.title.toLowerCase();
    return sportsKeywords.some(keyword => title.includes(keyword));
  };

  useEffect(() => {
    const loadLiveChannels = () => {
      setLoading(true);
      try {
        const channelsByCountry = getChannelsByCountry();
        const allChannels: any[] = [];
        
        // Collect all channels from all countries
        Object.values(channelsByCountry).forEach(channels => {
          allChannels.push(...channels);
        });
        
        // Filter for sports channels and simulate live content
        const sportsChannels = allChannels
          .filter(isChannelLive)
          .slice(0, 8) // Show max 8 live channels
          .map(channel => ({
            id: channel.id,
            title: channel.title,
            embedUrl: channel.embedUrl,
            logo: channel.logo,
            category: 'Live Sports',
            currentShow: generateCurrentShow(channel.title)
          }));
        
        setLiveChannels(sportsChannels);
        console.log('Live sports channels loaded:', sportsChannels);
      } catch (error) {
        console.error('Error loading live channels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLiveChannels();
    
    // Refresh every 2 minutes to simulate dynamic content
    const interval = setInterval(loadLiveChannels, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleWatchLive = (channel: LiveChannel) => {
    // Navigate to channels page with the specific channel pre-selected
    navigate('/channels', { 
      state: { 
        selectedChannel: {
          id: channel.id,
          title: channel.title,
          embedUrl: channel.embedUrl,
          logo: channel.logo
        },
        fromLiveWidget: true,
        currentShow: channel.currentShow
      } 
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card className={`bg-[#151922] border-[#343a4d] ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Tv className="h-5 w-5 text-[#ff5a36]" />
            Live Sports Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-[#242836] rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (liveChannels.length === 0) {
    return (
      <Card className={`bg-[#151922] border-[#343a4d] ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Clock className="h-5 w-5 text-gray-400" />
            Live Sports Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No live sports channels at the moment</p>
            <p className="text-gray-500 text-xs mt-1">Check back later for live content</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#151922] border-[#343a4d] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Tv className="h-5 w-5 text-[#ff5a36]" />
          Live Sports Channels
          <Badge variant="secondary" className="bg-[#ff5a36] text-white text-xs">
            {liveChannels.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {liveChannels.map(channel => (
            <div 
              key={channel.id}
              className="bg-[#242836] rounded-lg p-3 hover:bg-[#2a2f3a] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-[#ff5a36] text-white text-xs px-2 py-0.5 animate-pulse">
                      LIVE
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatTime()}
                    </span>
                  </div>
                  
                  <h4 className="text-white text-sm font-medium truncate mb-1">
                    {channel.title}
                  </h4>
                  
                  <p className="text-[#1EAEDB] text-xs mb-1">
                    Now Playing: {channel.currentShow}
                  </p>
                  
                  <p className="text-gray-400 text-xs">
                    {channel.category}
                  </p>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleWatchLive(channel)}
                  className="bg-[#ff5a36] hover:bg-[#e64d2e] text-white ml-3 flex-shrink-0"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Watch
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-[#343a4d]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/channels')}
            className="w-full bg-transparent border-[#343a4d] text-white hover:bg-[#242836]"
          >
            <Tv className="h-4 w-4 mr-2" />
            View All Channels
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveGamesWidget;
