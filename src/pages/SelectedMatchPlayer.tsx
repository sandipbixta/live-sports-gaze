import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Play, Tv, Calendar, MapPin, Loader, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import TeamLogo from '@/components/TeamLogo';
import { format } from 'date-fns';
import ChannelPlayerSelector, { PlayerType } from '@/components/StreamPlayer/ChannelPlayerSelector';
import TelegramBanner from '@/components/TelegramBanner';
import { triggerStreamChangeAd } from '@/utils/streamAdTrigger';

// Channel directly from API - has embedUrl directly
interface StreamChannel {
  id: string;
  name: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface SelectedMatch {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge: string | null;
  awayTeamBadge: string | null;
  homeScore: string | null;
  awayScore: string | null;
  sport: string;
  league: string;
  date: string;
  time: string;
  timestamp: string;
  venue: string | null;
  country: string | null;
  status: string | null;
  progress: string | null;
  poster: string | null;
  banner: string | null;
  isLive: boolean;
  isFinished: boolean;
  channels: StreamChannel[];
}

const SelectedMatchPlayer = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<HTMLDivElement>(null);
  
  const [match, setMatch] = useState<SelectedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<StreamChannel | null>(null);
  const [playerType, setPlayerType] = useState<PlayerType>('simple');
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
        
        if (error) {
          console.error('Error fetching matches:', error);
          return;
        }
        
        const matches = data?.matches || [];
        const foundMatch = matches.find((m: SelectedMatch) => m.id === matchId);
        
        if (foundMatch) {
          setMatch(foundMatch);
          // Auto-select first available channel with embedUrl
          const firstStreamable = foundMatch.channels?.find((ch: StreamChannel) => ch.embedUrl);
          if (firstStreamable) {
            setSelectedChannel(firstStreamable);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  // Scroll to player when channel is selected
  useEffect(() => {
    if (selectedChannel && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedChannel]);

  const handleChannelChange = (channel: StreamChannel) => {
    triggerStreamChangeAd();
    setSelectedChannel(channel);
  };

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 animate-spin text-[#ff5a36] mx-auto mb-4" />
          <p>Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
        <p className="text-gray-400 mb-6">The match you're looking for is not available.</p>
        <Link to="/">
          <Button className="bg-[#ff5a36] hover:bg-[#ff5a36]/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const matchDate = new Date(match.timestamp);
  const streamableChannels = match.channels?.filter(ch => ch.embedUrl) || [];

  // Create stream object for player
  const currentStream = selectedChannel?.embedUrl ? {
    id: selectedChannel.id,
    streamNo: 1,
    language: 'English',
    hd: true,
    embedUrl: selectedChannel.embedUrl,
    source: selectedChannel.name
  } : null;

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <Helmet>
        <title>{match.title} - Watch Live | DamiTV</title>
        <meta name="description" content={`Watch ${match.title} live stream. ${match.league} match available on DamiTV.`} />
      </Helmet>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-sm border-b border-[#343a4d]">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white hover:bg-[#242836]"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-sm md:text-lg font-bold text-white truncate px-2">{match.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {currentStream && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlayerSettings(!showPlayerSettings)}
                className="text-white hover:bg-[#242836]"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {match.isLive && (
              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                ● LIVE
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Telegram Banner */}
      <div className="px-4 pt-4">
        <TelegramBanner />
      </div>

      {/* Player Settings Panel */}
      {showPlayerSettings && currentStream && (
        <div className="px-4 pb-4">
          <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d]">
            <h3 className="text-white font-semibold mb-3">Video Player Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { type: 'simple' as PlayerType, name: 'Smart Player', desc: 'Best working option' },
                { type: 'iframe' as PlayerType, name: 'Direct Embed', desc: 'Shows provider controls' },
                { type: 'custom' as PlayerType, name: 'Custom Overlay', desc: 'Visual controls' },
                { type: 'basic' as PlayerType, name: 'Basic Player', desc: 'Simple iframe' },
              ].map((player) => (
                <button
                  key={player.type}
                  onClick={() => setPlayerType(player.type)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    playerType === player.type
                      ? 'bg-[#ff5a36] border-[#ff5a36] text-white'
                      : 'bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]'
                  }`}
                >
                  <div className="font-medium text-sm">{player.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{player.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {currentStream ? (
        <div ref={playerRef} className="w-full">
          <ChannelPlayerSelector
            stream={currentStream}
            isLoading={false}
            onRetry={handleRetry}
            playerType={playerType}
            title={`${match.homeTeam} vs ${match.awayTeam}`}
          />
        </div>
      ) : (
        <div className="px-4 py-8">
          <div className="bg-[#151922] rounded-xl p-8 text-center border border-[#343a4d]">
            <Tv className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Stream Selected</h3>
            <p className="text-gray-400 mb-4">
              {streamableChannels.length > 0 
                ? 'Select a channel below to start watching'
                : 'No streams available for this match yet'}
            </p>
            {streamableChannels.length === 0 && (
              <Link to="/live">
                <Button className="bg-[#ff5a36] hover:bg-[#ff5a36]/90">
                  <Tv className="w-4 h-4 mr-2" />
                  Browse All Live Streams
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Left Column - Match Info & Stream Sources */}
        <div className="flex-1 space-y-4">
          {/* Match Info Card */}
          <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d]">
            {/* League Info */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-[#242836] text-gray-300 text-xs">
                {match.sport}
              </Badge>
              <span className="text-gray-400 text-sm">{match.league}</span>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-4 mb-4">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center gap-2">
                  {match.homeTeamBadge ? (
                    <img 
                      src={match.homeTeamBadge} 
                      alt={match.homeTeam}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <TeamLogo teamName={match.homeTeam} sport={match.sport} size="lg" />
                  )}
                  <h2 className="text-sm font-bold text-white">{match.homeTeam}</h2>
                </div>
              </div>

              {/* Score or VS */}
              <div className="flex flex-col items-center gap-1">
                {match.isLive && match.homeScore !== null && match.awayScore !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-white">{match.homeScore}</span>
                    <span className="text-xl text-gray-500">-</span>
                    <span className="text-3xl font-bold text-white">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-gray-500">VS</span>
                )}
                {match.progress && match.isLive && (
                  <span className="text-xs text-red-500">{match.progress}</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center gap-2">
                  {match.awayTeamBadge ? (
                    <img 
                      src={match.awayTeamBadge} 
                      alt={match.awayTeam}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <TeamLogo teamName={match.awayTeam} sport={match.sport} size="lg" />
                  )}
                  <h2 className="text-sm font-bold text-white">{match.awayTeam}</h2>
                </div>
              </div>
            </div>

            {/* Match Time & Venue */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(matchDate, 'EEE, do MMM, h:mm a')}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{match.venue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stream Links */}
          {streamableChannels.length > 0 && (
            <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d]">
              <div className="flex items-center gap-2 mb-4">
                <Tv className="w-5 h-5 text-[#ff5a36]" />
                <h3 className="text-lg font-semibold text-white">Stream Links</h3>
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  {streamableChannels.length} available
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {streamableChannels.map((channel, index) => {
                  const isActive = selectedChannel?.id === channel.id;
                  return (
                    <Button
                      key={channel.id || index}
                      variant="outline"
                      onClick={() => handleChannelChange(channel)}
                      className={`h-auto py-3 px-4 flex flex-col items-center gap-1 transition-all ${
                        isActive
                          ? 'bg-[#ff5a36] border-[#ff5a36] text-white hover:bg-[#ff5a36]/90'
                          : 'bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d] hover:border-[#ff5a36]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-green-500'} animate-pulse`} />
                        <Play className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium truncate max-w-full">
                        {channel.name}
                      </span>
                      {channel.country && (
                        <span className="text-[10px] text-gray-400">
                          {channel.country}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - All Channels Sidebar */}
        {match.channels && match.channels.length > 0 && (
          <div className="lg:w-80">
            <div className="bg-[#151922] rounded-xl border border-[#343a4d] overflow-hidden">
              <div className="p-4 border-b border-[#343a4d]">
                <h3 className="font-semibold text-white text-sm">All Broadcast Channels</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {streamableChannels.length} with streams • {match.channels.length} total
                </p>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="p-2">
                  {match.channels.map((channel, index) => {
                    const hasStream = !!channel.embedUrl;
                    const isActive = selectedChannel?.id === channel.id;
                    
                    return (
                      <div
                        key={channel.id || index}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group ${
                          isActive 
                            ? 'bg-[#ff5a36]/20 border border-[#ff5a36]' 
                            : hasStream 
                              ? 'hover:bg-[#242836]' 
                              : 'opacity-50'
                        }`}
                        onClick={() => hasStream && handleChannelChange(channel)}
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          hasStream ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate transition-colors ${
                            isActive ? 'text-[#ff5a36]' : hasStream ? 'text-white group-hover:text-[#ff5a36]' : 'text-gray-500'
                          }`}>
                            {channel.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {channel.country}
                          </p>
                        </div>
                        
                        {hasStream && (
                          <ChevronRight className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-[#ff5a36]' : 'text-gray-400 group-hover:text-[#ff5a36]'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedMatchPlayer;
