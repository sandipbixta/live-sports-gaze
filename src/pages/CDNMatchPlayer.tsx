import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Tv, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CDNMatch, CDNMatchChannel, CDNMatchData } from '@/types/cdnMatch';
import IframeVideoPlayer from '@/components/StreamPlayer/IframeVideoPlayer';

const CDN_MATCHES_API = 'https://api.cdn-live.tv/api/v1/events/sports/';

const CDNMatchPlayer: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [match, setMatch] = useState<CDNMatch | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<CDNMatchChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState(false);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const response = await fetch(CDN_MATCHES_API);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: CDNMatchData = await response.json();
      
      if (data && data['cdn-live-tv']) {
        for (const [sport, sportMatches] of Object.entries(data['cdn-live-tv'])) {
          if (!Array.isArray(sportMatches)) continue;
          
          const found = sportMatches.find((m: CDNMatch) => m.gameID === gameId);
          if (found) {
            setMatch(found);
            if (found.channels.length > 0 && !selectedChannel) {
              setSelectedChannel(found.channels[0]);
            }
            break;
          }
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [gameId]);

  const handleChannelSelect = (channel: CDNMatchChannel) => {
    setSelectedChannel(channel);
    setStreamLoading(true);
    setStreamError(false);
  };

  const handleStreamLoad = () => {
    console.log('✅ CDN Stream loaded successfully');
    setStreamLoading(false);
    setStreamError(false);
  };

  const handleStreamError = () => {
    console.error('❌ CDN Stream failed to load');
    setStreamLoading(false);
    setStreamError(true);
  };

  // Parse match start time
  const getMatchStartTime = (): Date | null => {
    if (!match?.start) return null;
    try {
      return new Date(match.start);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Match Not Found</h1>
        <p className="text-muted-foreground">{error || 'Unable to find this match'}</p>
        <div className="flex gap-2">
          <Button onClick={fetchMatch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const matchStartTime = getMatchStartTime();

  return (
    <>
      <Helmet>
        <title>{`${match.homeTeam} vs ${match.awayTeam} - Live Stream | DAMITV`}</title>
        <meta name="description" content={`Watch ${match.homeTeam} vs ${match.awayTeam} live stream. ${match.tournament} - ${match.country}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <img src={match.countryIMG} alt={match.country} className="w-5 h-4 object-cover rounded-sm" />
                  <span className="text-sm text-muted-foreground">{match.tournament}</span>
                  {isLive && (
                    <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                  )}
                  {match.status === 'upcoming' && (
                    <Badge variant="secondary">UPCOMING</Badge>
                  )}
                  {match.status === 'finished' && (
                    <Badge variant="outline">FINISHED</Badge>
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  {match.homeTeam} vs {match.awayTeam}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player */}
            <div className="lg:col-span-2">
              {selectedChannel ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <IframeVideoPlayer
                    src={selectedChannel.url}
                    onLoad={handleStreamLoad}
                    onError={handleStreamError}
                    title={`${match.homeTeam} vs ${match.awayTeam}`}
                    matchStartTime={match.status === 'upcoming' ? matchStartTime : null}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Tv className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No channels available for this match</p>
                  </div>
                </div>
              )}

              {/* Stream Error State */}
              {streamError && selectedChannel && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">
                    Stream failed to load. Try selecting a different channel below.
                  </p>
                </div>
              )}

              {/* Match Info */}
              <Card className="mt-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={match.homeTeamIMG} 
                      alt={match.homeTeam} 
                      className="w-12 h-12 object-contain"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    <span className="font-bold text-foreground">{match.homeTeam}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-muted-foreground">VS</span>
                    <p className="text-sm text-muted-foreground">{match.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-foreground">{match.awayTeam}</span>
                    <img 
                      src={match.awayTeamIMG} 
                      alt={match.awayTeam} 
                      className="w-12 h-12 object-contain"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Channels Sidebar */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Tv className="w-5 h-5" />
                Available Channels ({match.channels.length})
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {match.channels.map((channel, idx) => {
                  const viewerCount = parseInt(channel.viewers) || 0;
                  return (
                    <Card 
                      key={idx}
                      className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedChannel?.url === channel.url ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={channel.image} 
                          alt={channel.channel_name}
                          className="w-10 h-10 object-contain rounded bg-white/5"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{channel.channel_name}</p>
                          <p className="text-xs text-muted-foreground uppercase">{channel.channel_code}</p>
                        </div>
                        {viewerCount > 0 && (
                          <div className="flex items-center gap-1 text-green-500 shrink-0">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{viewerCount}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {match.channels.length === 0 && (
                  <Card className="p-4 text-center">
                    <p className="text-muted-foreground">No channels broadcasting this match</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CDNMatchPlayer;
