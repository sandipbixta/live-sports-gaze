import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Play, Tv, Calendar, MapPin, Loader, Settings, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import TeamLogo from '@/components/TeamLogo';
import { format } from 'date-fns';
import ChannelPlayerSelector, { PlayerType } from '@/components/StreamPlayer/ChannelPlayerSelector';
import { triggerStreamChangeAd } from '@/utils/streamAdTrigger';
import SEOMetaTags from '@/components/SEOMetaTags';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p>Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
        <p className="text-muted-foreground mb-6">The match you're looking for is not available.</p>
        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const matchDate = new Date(match.timestamp);
  const streamableChannels = match.channels?.filter(ch => ch.embedUrl) || [];
  const matchTitle = `${match.homeTeam} vs ${match.awayTeam}`;
  const matchDescription = `Watch ${matchTitle} live stream online for free on DamiTV. ${match.league} match with HD quality streaming.`;

  const currentStream = selectedChannel?.embedUrl ? {
    id: selectedChannel.id,
    streamNo: 1,
    language: 'English',
    hd: true,
    embedUrl: selectedChannel.embedUrl,
    source: selectedChannel.name
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOMetaTags
        title={`${matchTitle} - Live Stream | DamiTV`}
        description={matchDescription}
        keywords={`${match.homeTeam} live stream, ${match.awayTeam} online, ${matchTitle}, live football streaming`}
        canonicalUrl={`https://damitv.pro/selected-match/${matchId}`}
        ogImage={match.poster || 'https://i.imgur.com/m4nV9S8.png'}
        matchInfo={{
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          league: match.league,
          date: matchDate,
        }}
        breadcrumbs={[
          { name: 'Home', url: 'https://damitv.pro/' },
          { name: 'Live Matches', url: 'https://damitv.pro/live' },
          { name: matchTitle, url: `https://damitv.pro/selected-match/${matchId}` }
        ]}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": matchTitle,
            "description": matchDescription,
            "startDate": matchDate.toISOString(),
            "eventStatus": match.isLive ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
              "@type": "VirtualLocation",
              "url": `https://damitv.pro/selected-match/${matchId}`
            },
            "image": match.poster || 'https://i.imgur.com/m4nV9S8.png',
            "organizer": {
              "@type": "Organization",
              "name": "DamiTV",
              "url": "https://damitv.pro"
            },
            "competitor": [
              { "@type": "SportsTeam", "name": match.homeTeam },
              { "@type": "SportsTeam", "name": match.awayTeam }
            ]
          })}
        </script>
      </Helmet>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStream && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlayerSettings(!showPlayerSettings)}
                className="text-foreground hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Match Score Bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            {/* League & Status */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="secondary" className="text-xs">
                {match.sport}
              </Badge>
              <span className="text-muted-foreground text-sm">{match.league}</span>
              {match.isLive && (
                <Badge className="bg-red-500 text-white text-xs animate-pulse">
                  ● LIVE
                </Badge>
              )}
            </div>

            {/* Teams & Score */}
            <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-lg">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center gap-1">
                {match.homeTeamBadge ? (
                  <img 
                    src={match.homeTeamBadge} 
                    alt={match.homeTeam}
                    className="w-10 h-10 md:w-14 md:h-14 object-contain"
                  />
                ) : (
                  <TeamLogo teamName={match.homeTeam} sport={match.sport} size="md" />
                )}
                <span className="text-xs md:text-sm font-medium text-foreground text-center line-clamp-2">
                  {match.homeTeam}
                </span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center">
                {match.isLive && match.homeScore !== null && match.awayScore !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl md:text-4xl font-bold text-foreground">{match.homeScore}</span>
                    <span className="text-lg md:text-2xl text-muted-foreground">-</span>
                    <span className="text-2xl md:text-4xl font-bold text-foreground">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-lg md:text-xl font-bold text-muted-foreground">VS</span>
                )}
                {match.progress && match.isLive && (
                  <span className="text-xs text-red-500 font-medium">{match.progress}</span>
                )}
                {!match.isLive && (
                  <span className="text-xs text-muted-foreground">
                    {format(matchDate, 'h:mm a')}
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center gap-1">
                {match.awayTeamBadge ? (
                  <img 
                    src={match.awayTeamBadge} 
                    alt={match.awayTeam}
                    className="w-10 h-10 md:w-14 md:h-14 object-contain"
                  />
                ) : (
                  <TeamLogo teamName={match.awayTeam} sport={match.sport} size="md" />
                )}
                <span className="text-xs md:text-sm font-medium text-foreground text-center line-clamp-2">
                  {match.awayTeam}
                </span>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap justify-center">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(matchDate, 'EEE, do MMM')}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{match.venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Settings Panel */}
      {showPlayerSettings && currentStream && (
        <div className="container mx-auto px-4 pb-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-semibold mb-3">Video Player Settings</h3>
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
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-border text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="font-medium text-sm">{player.name}</div>
                  <div className="text-xs opacity-70 mt-1">{player.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Video + Broadcasters */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Video Player */}
          <div className="flex-1 min-w-0" ref={playerRef}>
            {currentStream ? (
              <div className="rounded-xl overflow-hidden border border-border">
                <ChannelPlayerSelector
                  stream={currentStream}
                  isLoading={false}
                  onRetry={handleRetry}
                  playerType={playerType}
                  title={matchTitle}
                />
              </div>
            ) : (
              <div className="bg-card rounded-xl p-8 text-center border border-border aspect-video flex flex-col items-center justify-center">
                <Tv className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Stream Selected</h3>
                <p className="text-muted-foreground mb-4">
                  {streamableChannels.length > 0 
                    ? 'Select a broadcaster to start watching'
                    : 'No streams available for this match yet'}
                </p>
                {streamableChannels.length === 0 && (
                  <Link to="/live">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Tv className="w-4 h-4 mr-2" />
                      Browse All Live Streams
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right: Broadcasters List (Desktop) */}
          <div className="hidden lg:block lg:w-80">
            <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-20">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Broadcasters</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {streamableChannels.length} available channels
                </p>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-1">
                  {match.channels?.map((channel, index) => {
                    const hasStream = !!channel.embedUrl;
                    const isActive = selectedChannel?.id === channel.id;
                    
                    return (
                      <button
                        key={channel.id || index}
                        disabled={!hasStream}
                        onClick={() => hasStream && handleChannelChange(channel)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : hasStream 
                              ? 'hover:bg-muted text-foreground' 
                              : 'opacity-40 cursor-not-allowed text-muted-foreground'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isActive ? 'bg-primary-foreground' : hasStream ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {channel.name}
                          </div>
                          {channel.country && (
                            <div className="text-xs opacity-70">
                              {channel.country}
                            </div>
                          )}
                        </div>
                        
                        {hasStream && (
                          <Play className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Mobile: Broadcasters List */}
        <div className="lg:hidden mt-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Broadcasters</h3>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {streamableChannels.length} live
                </Badge>
              </div>
            </div>
            
            <div className="p-3 grid grid-cols-2 gap-2">
              {streamableChannels.map((channel, index) => {
                const isActive = selectedChannel?.id === channel.id;
                
                return (
                  <Button
                    key={channel.id || index}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleChannelChange(channel)}
                    className={`h-auto py-3 flex flex-col items-center gap-1 ${
                      isActive ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary-foreground' : 'bg-green-500'} animate-pulse`} />
                      <Play className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium truncate max-w-full">
                      {channel.name}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedMatchPlayer;
