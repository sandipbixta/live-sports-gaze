import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Home, Loader, Clock, RefreshCw, Play, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import TeamLogo from '@/components/TeamLogo';
import { format } from 'date-fns';
import ChannelPlayerSelector, { PlayerType } from '@/components/StreamPlayer/ChannelPlayerSelector';
import { triggerStreamChangeAd } from '@/utils/streamAdTrigger';
import SEOMetaTags from '@/components/SEOMetaTags';
import { useToast } from '@/hooks/use-toast';

// Lazy load components
const TelegramBanner = lazy(() => import('@/components/TelegramBanner'));
const SocialShare = lazy(() => import('@/components/SocialShare'));
const FavoriteButton = lazy(() => import('@/components/FavoriteButton'));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-32" }: { height?: string }) => (
  <div className={`${height} bg-card rounded-lg animate-pulse`} />
);

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
  sportIcon: string;
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
  const { toast } = useToast();
  const playerRef = useRef<HTMLDivElement>(null);
  
  const [match, setMatch] = useState<SelectedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<StreamChannel | null>(null);
  const [playerType, setPlayerType] = useState<PlayerType>('simple');
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
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

  const handleRefresh = async () => {
    setRefreshing(true);
    toast({
      title: "Refreshing streams...",
      description: "Scanning for available streams",
    });
    await fetchMatch();
    setRefreshing(false);
    toast({
      title: "Refresh complete",
      description: `Found ${match?.channels?.filter(c => c.embedUrl).length || 0} streams`,
    });
  };

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sports-dark flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p>Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-sports-dark flex flex-col items-center justify-center text-white">
        <Tv className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
        <p className="text-gray-400 mb-6">The match you're looking for is not available.</p>
        <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
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
    <div className="min-h-screen bg-sports-dark text-sports-light">
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

      {/* Header - Same style as Match.tsx */}
      <header className="bg-sports-darker shadow-md">
        <div className="container mx-auto py-2 sm:py-4 px-2 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="text-gray-300 hover:text-white touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft className="mr-1" />
                Back
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <Home className="mr-1" />
                Home
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Suspense fallback={null}>
                <FavoriteButton
                  type="match"
                  id={matchId || ''}
                  name={matchTitle}
                  variant="outline"
                />
              </Suspense>
              <Suspense fallback={null}>
                <SocialShare 
                  title={matchTitle}
                  description={matchDescription}
                  image={match.poster || 'https://i.imgur.com/m4nV9S8.png'}
                  url={`https://damitv.pro/selected-match/${matchId}`}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Telegram Banner */}
        <div className="mb-4">
          <Suspense fallback={<LoadingPlaceholder height="h-16" />}>
            <TelegramBanner />
          </Suspense>
        </div>
        
        {/* Match Title with Badges */}
        <div className="w-full flex justify-center mb-4">
          <div className="text-center max-w-4xl px-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {match.homeTeamBadge ? (
                <img 
                  src={match.homeTeamBadge} 
                  alt={match.homeTeam}
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
              ) : (
                <TeamLogo teamName={match.homeTeam} sport={match.sport} size="md" />
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-white">{match.title}</h1>
              {match.awayTeamBadge ? (
                <img 
                  src={match.awayTeamBadge} 
                  alt={match.awayTeam}
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
              ) : (
                <TeamLogo teamName={match.awayTeam} sport={match.sport} size="md" />
              )}
            </div>
            <p className="text-sm md:text-base text-gray-400">{match.league} • {format(matchDate, 'EEE, do MMM h:mm a')}</p>
          </div>
        </div>
        
        {/* Video Player Section - Same layout as Match.tsx */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0" ref={playerRef} id="stream-container" data-stream-container>
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
              <div className="bg-sports-card rounded-xl p-8 text-center border border-border aspect-video flex flex-col items-center justify-center">
                <Tv className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Stream Selected</h3>
                <p className="text-gray-400 mb-4">
                  {streamableChannels.length > 0 
                    ? 'Select a stream source below to start watching'
                    : 'No streams available for this match yet'}
                </p>
                {streamableChannels.length === 0 && (
                  <Button onClick={() => navigate('/live')} className="bg-primary hover:bg-primary/90">
                    <Tv className="w-4 h-4 mr-2" />
                    Browse All Live Streams
                  </Button>
                )}
              </div>
            )}
            
            {/* Stream Sources - Similar to StreamSources component */}
            {streamableChannels.length > 0 && (
              <Card className="bg-sports-card border-border mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Play className="w-4 h-4 text-primary" />
                      Available Streams
                      <Badge variant="secondary" className="ml-2">
                        {streamableChannels.length}
                      </Badge>
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {streamableChannels.map((channel, index) => {
                      const isActive = selectedChannel?.id === channel.id;
                      
                      return (
                        <button
                          key={channel.id || index}
                          onClick={() => handleChannelChange(channel)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            isActive 
                              ? 'bg-primary border-primary text-white' 
                              : 'bg-sports-darker border-border text-gray-300 hover:border-primary hover:bg-sports-dark'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isActive ? 'bg-white' : 'bg-green-500 animate-pulse'
                            }`} />
                            <span className="text-sm font-medium truncate">{channel.name}</span>
                          </div>
                          {channel.country && (
                            <span className="text-xs opacity-60 mt-1 block">{channel.country}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Live/Status Badge - Same as StreamTab */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-3">
                {match.isLive ? (
                  <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1">
                    <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
                    LIVE NOW
                    {match.progress && ` - ${match.progress}`}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                    <Clock size={14} />
                    {format(matchDate, 'h:mm a')}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Player Type Selector */}
            <Card className="bg-sports-card border-border mt-4">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3">Player Options</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { type: 'simple' as PlayerType, name: 'Smart Player', desc: 'Best working' },
                    { type: 'iframe' as PlayerType, name: 'Direct Embed', desc: 'Provider controls' },
                    { type: 'custom' as PlayerType, name: 'Custom Overlay', desc: 'Visual controls' },
                    { type: 'basic' as PlayerType, name: 'Basic Player', desc: 'Simple iframe' },
                  ].map((player) => (
                    <button
                      key={player.type}
                      onClick={() => setPlayerType(player.type)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        playerType === player.type
                          ? 'bg-primary border-primary text-white'
                          : 'bg-sports-darker border-border text-gray-300 hover:border-primary'
                      }`}
                    >
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-xs opacity-70 mt-1">{player.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Match Details */}
        <Card className="bg-sports-card border-border mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Match Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Competition</span>
                <p className="text-white font-medium">{match.league}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Sport</span>
                <p className="text-white font-medium">{match.sportIcon} {match.sport}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Date</span>
                <p className="text-white font-medium">{format(matchDate, 'EEEE, MMMM do')}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Time</span>
                <p className="text-white font-medium">{format(matchDate, 'h:mm a')}</p>
              </div>
            </div>
            
            {/* Score Section for Live Matches */}
            {match.isLive && match.homeScore !== null && match.awayScore !== null && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    {match.homeTeamBadge && (
                      <img src={match.homeTeamBadge} alt={match.homeTeam} className="w-12 h-12 mx-auto mb-2 object-contain" />
                    )}
                    <p className="text-white font-medium">{match.homeTeam}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">
                      {match.homeScore} - {match.awayScore}
                    </div>
                    {match.progress && (
                      <Badge variant="destructive" className="mt-2">{match.progress}</Badge>
                    )}
                  </div>
                  <div className="text-center">
                    {match.awayTeamBadge && (
                      <img src={match.awayTeamBadge} alt={match.awayTeam} className="w-12 h-12 mx-auto mb-2 object-contain" />
                    )}
                    <p className="text-white font-medium">{match.awayTeam}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <footer className="bg-sports-darker text-gray-400 py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 DamiTV - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default SelectedMatchPlayer;
