import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Home, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/PageLayout';
import LoadingState from '@/components/match/LoadingState';
import { Helmet } from 'react-helmet-async';
import IPTVPlayer from '@/components/StreamPlayer/IPTVPlayer';

const XtreamChannelPlayer = () => {
  const { provider, channelId } = useParams<{ provider: string; channelId: string }>();
  const { toast } = useToast();
  const [channel, setChannel] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadChannelInfo();
  }, [provider, channelId]);

  const loadChannelInfo = async () => {
    if (!provider || !channelId) {
      setError('Missing provider or channel information');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('🎬 Loading Xtream channel:', { provider, channelId });

      // Parse stream ID from channel ID (format: xtream-{provider}-{streamId})
      const streamId = channelId.replace(`xtream-${provider}-`, '');
      
      // First get the stream URL from Xtream API
      const response = await fetch(`https://wxvsteaayxgygihpshoz.supabase.co/functions/v1/xtream-proxy?action=stream_url&provider=${provider}&stream=${streamId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get stream URL: ${response.statusText}`);
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No stream URL received from provider');
      }

      console.log('✅ Stream URL received:', url);
      setStreamUrl(url);
      
      // Set mock channel info (we could fetch this from another API call if needed)
      setChannel({
        id: channelId,
        name: decodeURIComponent(channelId.split('-').pop() || 'Unknown Channel'),
        provider: provider
      });

    } catch (err) {
      console.error('❌ Error loading Xtream channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to load channel');
      toast({
        title: "Error",
        description: "Failed to load the channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadChannelInfo();
  };

  const handlePlayerError = () => {
    console.log('❌ IPTV Player error occurred');
    toast({
      title: "Playback Error",
      description: "There was an issue playing this stream. Retrying...",
      variant: "destructive",
    });
    // Auto-retry after a short delay
    setTimeout(() => {
      handleRetry();
    }, 2000);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-background">
          <LoadingState />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load Channel</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Link to="/channels">
                <Button variant="outline">Back to Channels</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Helmet>
        <title>{channel?.name ? `${channel.name} - DamiTV Live IPTV` : 'Live IPTV Channel - DamiTV'}</title>
        <meta name="description" content={`Watch ${channel?.name || 'live IPTV channel'} free online. Premium IPTV streaming in HD quality.`} />
        <meta name="keywords" content={`${channel?.name || 'iptv'}, live streaming, xtream codes, online tv, free iptv`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Link to="/channels">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Channels
                </Button>
              </Link>
              
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground line-clamp-1">
                  {channel?.name || 'Live IPTV Channel'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Xtream Codes • {provider}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
                
                <Link to="/">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
              {streamUrl ? (
                <IPTVPlayer
                  streamUrl={streamUrl}
                  title={channel?.name || 'Live IPTV Stream'}
                  onError={handlePlayerError}
                  onRetry={handleRetry}
                />
              ) : (
                <div className="aspect-video flex items-center justify-center bg-black">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading stream...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="mt-6 bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {channel?.name || 'IPTV Channel'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-2 font-medium">{provider}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">Xtream Codes IPTV</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium text-green-600">🔴 Live</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="ml-2 font-medium">HD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default XtreamChannelPlayer;