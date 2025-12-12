import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Users, ChevronRight } from 'lucide-react';
import { getPopularChannels, CDNChannel } from '../services/cdnLiveService';

const LiveChannelsCDN = () => {
  const [channels, setChannels] = useState<CDNChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await getPopularChannels(12);
        setChannels(data);
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
    const interval = setInterval(fetchChannels, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Tv className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-foreground">LIVE CHANNELS</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (channels.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tv className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">LIVE CHANNELS</h2>
            <p className="text-muted-foreground text-sm">Popular channels right now</p>
          </div>
        </div>
        <Link 
          to="/channels"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          All Channels
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {channels.map((channel) => (
          <ChannelCard key={`${channel.name}-${channel.code}`} channel={channel} />
        ))}
      </div>
    </section>
  );
};

const ChannelCard = ({ channel }: { channel: CDNChannel }) => {
  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-card rounded-xl p-3 hover:bg-accent hover:ring-2 hover:ring-blue-500 transition-all"
    >
      <div className="h-12 flex items-center justify-center mb-2">
        {channel.image ? (
          <img
            src={channel.image}
            alt={channel.name}
            className="max-h-12 max-w-full object-contain"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fallback = (e.target as HTMLImageElement).nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-10 h-10 bg-muted rounded-lg flex items-center justify-center ${channel.image ? 'hidden' : ''}`}>
          <Tv className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
      
      <p className="text-foreground text-xs font-medium text-center truncate mb-1">
        {channel.name}
      </p>
      
      {channel.viewers > 0 && (
        <div className="flex items-center justify-center gap-1 text-green-500 text-xs">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <Users className="w-3 h-3" />
          {channel.viewers}
        </div>
      )}
    </a>
  );
};

export default LiveChannelsCDN;
