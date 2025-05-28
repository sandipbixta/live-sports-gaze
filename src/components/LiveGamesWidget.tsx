
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tv, Play, Clock } from 'lucide-react';
import { Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import { getChannelsByCountry } from '@/data/tvChannels';
import { useNavigate } from 'react-router-dom';

interface LiveGamesWidgetProps {
  className?: string;
}

const LiveGamesWidget: React.FC<LiveGamesWidgetProps> = ({ className = '' }) => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const channelsByCountry = getChannelsByCountry();

  // Helper function to check if a match is live
  const isMatchLive = (match: Match): boolean => {
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      Math.abs(matchTime - now) < twoHoursInMs
    );
  };

  // Find matching channel for a match
  const findMatchingChannel = (match: Match) => {
    const allChannels = Object.values(channelsByCountry).flat();
    
    // Try to find a channel that matches the match title or teams
    const matchingChannel = allChannels.find(channel => {
      const channelTitle = channel.title.toLowerCase();
      const matchTitle = match.title.toLowerCase();
      const homeTeam = match.teams?.home?.name?.toLowerCase() || '';
      const awayTeam = match.teams?.away?.name?.toLowerCase() || '';
      
      return channelTitle.includes('sports') || 
             channelTitle.includes('football') ||
             channelTitle.includes('soccer') ||
             matchTitle.includes(channelTitle) ||
             channelTitle.includes(homeTeam) ||
             channelTitle.includes(awayTeam);
    });

    // If no specific match, return a default sports channel
    return matchingChannel || allChannels.find(channel => 
      channel.title.toLowerCase().includes('sports') ||
      channel.title.toLowerCase().includes('football')
    );
  };

  useEffect(() => {
    const loadLiveMatches = async () => {
      setLoading(true);
      try {
        const sports = await fetchSports();
        const allMatches: Match[] = [];
        
        // Fetch matches for all sports
        for (const sport of sports.slice(0, 5)) { // Limit to first 5 sports for performance
          try {
            const matches = await fetchMatches(sport.id);
            allMatches.push(...matches);
          } catch (error) {
            console.error(`Error fetching matches for ${sport.id}:`, error);
          }
        }
        
        // Filter for live matches
        const live = allMatches.filter(isMatchLive).slice(0, 6); // Show max 6 live matches
        setLiveMatches(live);
      } catch (error) {
        console.error('Error loading live matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLiveMatches();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadLiveMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleWatchLive = (match: Match) => {
    const channel = findMatchingChannel(match);
    if (channel) {
      // Navigate to channels page with the specific channel
      navigate('/channels', { 
        state: { 
          selectedChannel: channel,
          fromLiveMatch: true,
          matchTitle: match.title 
        } 
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card className={`bg-[#151922] border-[#343a4d] ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Tv className="h-5 w-5 text-[#ff5a36]" />
            Live Now
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

  if (liveMatches.length === 0) {
    return (
      <Card className={`bg-[#151922] border-[#343a4d] ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Clock className="h-5 w-5 text-gray-400" />
            Live Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No live games at the moment</p>
            <p className="text-gray-500 text-xs mt-1">Check back later for live matches</p>
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
          Live Now
          <Badge variant="secondary" className="bg-[#ff5a36] text-white text-xs">
            {liveMatches.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {liveMatches.map(match => {
            const channel = findMatchingChannel(match);
            
            return (
              <div 
                key={match.id}
                className="bg-[#242836] rounded-lg p-3 hover:bg-[#2a2f3a] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-[#ff5a36] text-white text-xs px-2 py-0.5 animate-pulse">
                        LIVE
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatTime(match.date)}
                      </span>
                    </div>
                    
                    <h4 className="text-white text-sm font-medium truncate mb-1">
                      {match.title}
                    </h4>
                    
                    {match.teams?.home && match.teams?.away && (
                      <p className="text-gray-300 text-xs">
                        {match.teams.home.name} vs {match.teams.away.name}
                      </p>
                    )}
                    
                    {channel && (
                      <p className="text-[#1EAEDB] text-xs mt-1">
                        Available on: {channel.title}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleWatchLive(match)}
                    className="bg-[#ff5a36] hover:bg-[#e64d2e] text-white ml-3 flex-shrink-0"
                    disabled={!channel}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Watch
                  </Button>
                </div>
              </div>
            );
          })}
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
