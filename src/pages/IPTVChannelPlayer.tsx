import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import IPTVPlayer from '@/components/StreamPlayer/IPTVPlayer';
import TelegramBanner from '@/components/TelegramBanner';
import { getAllChannelSources } from '@/data/tvChannels';

const IPTVChannelPlayer = () => {
  const { provider, channelId } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadChannel = async () => {
      if (!provider || !channelId) {
        navigate('/channels');
        return;
      }

      try {
        const iptvChannels = await getAllChannelSources();
        const providerChannels = iptvChannels[provider];
        
        if (!providerChannels) {
          console.error('Provider not found:', provider);
          navigate('/channels');
          return;
        }

        const foundChannel = providerChannels.find((ch: any) => ch.id === channelId);
        
        if (!foundChannel) {
          console.error('Channel not found:', channelId);
          navigate('/channels');
          return;
        }

        setChannel({ ...foundChannel, provider });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading IPTV channel:', error);
        navigate('/channels');
      }
    };

    loadChannel();
  }, [provider, channelId, navigate]);

  const handleGoBack = () => {
    navigate('/channels');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading || !channel) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5a36] mx-auto mb-4"></div>
          <p>Loading IPTV channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <Helmet>
        <title>{channel.title} - IPTV Live Stream | DamiTV</title>
        <meta name="description" content={`Watch ${channel.title} IPTV live stream online for free on DamiTV`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
      </Helmet>

      {/* Mobile-optimized header */}
      <div className="sticky top-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-sm border-b border-[#343a4d]">
        <div className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="text-white hover:bg-[#242836]"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white truncate">{channel.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">
              IPTV
            </Badge>
            <Badge className="bg-red-500 text-white text-xs">
              • LIVE
            </Badge>
          </div>
        </div>
      </div>

      {/* Telegram Banner */}
      <div className="px-4 pt-4">
        <TelegramBanner />
      </div>

      {/* IPTV Player */}
      <div className="w-full px-4 py-4">
        <IPTVPlayer
          streamUrl={channel.embedUrl}
          title={channel.title}
          onRetry={handleRetry}
          className="w-full"
        />
      </div>

      {/* Channel Info */}
      <div className="px-4 pb-4">
        <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d]">
          <div className="flex items-start gap-4">
            {/* Channel Logo */}
            <div className="w-16 h-16 rounded-xl bg-[#343a4d] flex items-center justify-center overflow-hidden flex-shrink-0">
              {channel.logo ? (
                <img 
                  src={channel.logo} 
                  alt={channel.title}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-lg font-bold text-white ${channel.logo ? 'hidden' : ''}`}>
                {channel.title.split(' ').map((word: string) => word.charAt(0).toUpperCase()).slice(0, 2).join('')}
              </div>
            </div>
            
            {/* Channel Details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-2">{channel.title}</h2>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                <span>Provider: {channel.provider}</span>
                {channel.country && <span>• {channel.country}</span>}
                {channel.language && <span>• {channel.language}</span>}
                {channel.group && <span>• {channel.group}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for IPTV */}
      <div className="px-4 pb-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="text-blue-400 font-semibold mb-2">IPTV Streaming Tips</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• If stream doesn't load, try refreshing the page</li>
            <li>• Some channels may take longer to start</li>
            <li>• Quality depends on the source provider</li>
            <li>• Use fullscreen for better viewing experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IPTVChannelPlayer;