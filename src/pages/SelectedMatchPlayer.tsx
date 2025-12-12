import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Play, Tv, Users, Calendar, MapPin, Loader, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TeamLogo from '@/components/TeamLogo';
import { format } from 'date-fns';
import MainNav from '@/components/MainNav';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

interface CDNChannel {
  id: string;
  title: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface BroadcastChannel {
  id: string;
  name: string;
  logo: string | null;
  country: string;
  language: string | null;
  cdnChannel: CDNChannel | null;
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
  channels: BroadcastChannel[];
}

const SelectedMatchPlayer = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState<SelectedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<BroadcastChannel | null>(null);

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
          // Auto-select first available CDN channel
          const firstStreamable = foundMatch.channels?.find((ch: BroadcastChannel) => ch.cdnChannel);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Match Not Found</h1>
          <p className="text-muted-foreground mb-6">The match you're looking for is not available.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const matchDate = new Date(match.timestamp);
  const streamableChannels = match.channels?.filter(ch => ch.cdnChannel) || [];
  const allBroadcastChannels = match.channels || [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{match.title} - Watch Live | DamiTV</title>
        <meta name="description" content={`Watch ${match.title} live stream. ${match.league} match available on DamiTV with multiple broadcast channels.`} />
      </Helmet>
      
      <MainNav />
      
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Match Header */}
        <div className="bg-card rounded-xl overflow-hidden mb-6">
          {/* Banner/Poster */}
          {match.poster && (
            <div className="aspect-video max-h-[300px] overflow-hidden">
              <img 
                src={match.poster} 
                alt={match.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Match Info */}
          <div className="p-6">
            {/* League & Status */}
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-xs">
                {match.sport}
              </Badge>
              <span className="text-muted-foreground text-sm">{match.league}</span>
              {match.isLive && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  ● LIVE
                </Badge>
              )}
              {streamableChannels.length > 0 && !match.isLive && (
                <Badge className="bg-green-500 text-white">
                  FREE
                </Badge>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center gap-3">
                  {match.homeTeamBadge ? (
                    <img 
                      src={match.homeTeamBadge} 
                      alt={match.homeTeam}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <TeamLogo teamName={match.homeTeam} sport={match.sport} size="lg" />
                  )}
                  <h2 className="text-lg font-bold text-foreground">{match.homeTeam}</h2>
                </div>
              </div>

              {/* Score or VS */}
              <div className="flex flex-col items-center gap-2">
                {match.isLive && match.homeScore !== null && match.awayScore !== null ? (
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-foreground">{match.homeScore}</span>
                    <span className="text-2xl text-muted-foreground">-</span>
                    <span className="text-4xl font-bold text-foreground">{match.awayScore}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">VS</span>
                )}
                {match.progress && match.isLive && (
                  <span className="text-sm text-red-500">{match.progress}</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="flex flex-col items-center gap-3">
                  {match.awayTeamBadge ? (
                    <img 
                      src={match.awayTeamBadge} 
                      alt={match.awayTeam}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <TeamLogo teamName={match.awayTeam} sport={match.sport} size="lg" />
                  )}
                  <h2 className="text-lg font-bold text-foreground">{match.awayTeam}</h2>
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(matchDate, 'EEE, do MMM yyyy, h:mm a')}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{match.venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stream Links Section */}
        <div className="bg-card rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Tv className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Stream Links</h3>
            {streamableChannels.length > 0 && (
              <Badge variant="secondary">{streamableChannels.length} available</Badge>
            )}
          </div>

          {streamableChannels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {streamableChannels.map((channel, index) => (
                <Link
                  key={channel.id || index}
                  to={`/channel/${channel.cdnChannel?.country}/${channel.cdnChannel?.id}`}
                  className="group"
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto py-3 px-4 flex flex-col items-center gap-2 bg-background hover:bg-primary/10 hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <Play className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-full">
                      {channel.name}
                    </span>
                    {channel.country && (
                      <span className="text-xs text-muted-foreground">
                        {channel.country}
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No direct streams available for this match yet.</p>
              <Link to="/live">
                <Button>
                  <Tv className="w-4 h-4 mr-2" />
                  Browse All Live Streams
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* All Broadcast Channels */}
        {allBroadcastChannels.length > 0 && (
          <div className="bg-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">All Broadcast Channels</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allBroadcastChannels.map((channel, index) => (
                <div
                  key={channel.id || index}
                  className={`p-3 rounded-lg border ${
                    channel.cdnChannel 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {channel.cdnChannel && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="Stream available" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {channel.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {channel.country}
                    {channel.language && ` • ${channel.language}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default SelectedMatchPlayer;
