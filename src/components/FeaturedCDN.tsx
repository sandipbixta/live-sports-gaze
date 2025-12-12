import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ChevronRight, Play, Tv } from 'lucide-react';
import { 
  getFeaturedCDNEventsWithImages,
  FormattedCDNEvent,
  fetchTeamBadge 
} from '../services/cdnLiveService';

const SPORT_ICONS: Record<string, string> = {
  football: '⚽', soccer: '⚽', basketball: '🏀', nba: '🏀',
  nfl: '🏈', hockey: '🏒', nhl: '🏒', baseball: '⚾', mlb: '⚾',
  tennis: '🎾', cricket: '🏏', rugby: '🏉', mma: '🥊', ufc: '🥊',
  boxing: '🥊', f1: '🏎️', motorsport: '🏎️', sports: '🏆', default: '🏆'
};

const getSportIcon = (sport: string): string => {
  const key = sport?.toLowerCase() || 'default';
  return SPORT_ICONS[key] || SPORT_ICONS.default;
};

const SPORT_GRADIENTS: Record<string, string> = {
  football: 'from-green-900/50 to-green-950/80',
  soccer: 'from-green-900/50 to-green-950/80',
  basketball: 'from-orange-900/50 to-orange-950/80',
  nba: 'from-orange-900/50 to-orange-950/80',
  nfl: 'from-blue-900/50 to-blue-950/80',
  hockey: 'from-cyan-900/50 to-cyan-950/80',
  nhl: 'from-cyan-900/50 to-cyan-950/80',
  default: 'from-gray-800/50 to-gray-900/80'
};

const getSportGradient = (sport: string): string => {
  const key = sport?.toLowerCase() || 'default';
  return SPORT_GRADIENTS[key] || SPORT_GRADIENTS.default;
};

const FeaturedCDN = () => {
  const [events, setEvents] = useState<FormattedCDNEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getFeaturedCDNEventsWithImages(12);
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch CDN events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">FEATURED SPORTS</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">FEATURED SPORTS</h2>
            <p className="text-muted-foreground text-sm">Live & upcoming events</p>
          </div>
        </div>
        <Link 
          to="/live"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {events.map((event) => (
          <CDNEventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};

const CDNEventCard = ({ event }: { event: FormattedCDNEvent }) => {
  const [homeBadge, setHomeBadge] = useState<string | null>(event.homeTeam.badge);
  const [awayBadge, setAwayBadge] = useState<string | null>(event.awayTeam.badge);
  
  const sportIcon = getSportIcon(event.sport);
  const gradient = getSportGradient(event.sport);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!homeBadge && event.homeTeam.name !== 'TBD') {
        const badge = await fetchTeamBadge(event.homeTeam.name);
        if (badge) setHomeBadge(badge);
      }
      if (!awayBadge && event.awayTeam.name !== 'TBD') {
        const badge = await fetchTeamBadge(event.awayTeam.name);
        if (badge) setAwayBadge(badge);
      }
    };
    fetchBadges();
  }, [event.homeTeam.name, event.awayTeam.name, homeBadge, awayBadge]);

  const formatTime = () => {
    if (event.isLive) return null;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const time = event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (event.date.toDateString() === now.toDateString()) {
      return time;
    } else if (event.date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${time}`;
    }
    return event.date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + time;
  };

  return (
    <Link
      to={`/match/${event.sport}/${event.id}`}
      className="group relative bg-card rounded-xl overflow-hidden hover:ring-2 hover:ring-primary hover:scale-[1.02] transition-all duration-300"
    >
      <div className={`relative h-32 md:h-36 bg-gradient-to-br ${gradient}`}>
        {event.poster && (
          <img
            src={event.poster}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
          }} />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
          <div className="text-center">
            {homeBadge ? (
              <img 
                src={homeBadge} 
                alt={event.homeTeam.name}
                className="w-10 h-10 md:w-12 md:h-12 object-contain mx-auto mb-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="text-3xl md:text-4xl mb-1">{sportIcon}</div>
            )}
            <span className="text-foreground text-xs font-medium truncate block max-w-[70px]">
              {event.homeTeam.name.split(' ').slice(-1)[0]}
            </span>
          </div>
          
          <span className="text-muted-foreground text-sm font-bold">VS</span>
          
          <div className="text-center">
            {awayBadge ? (
              <img 
                src={awayBadge} 
                alt={event.awayTeam.name}
                className="w-10 h-10 md:w-12 md:h-12 object-contain mx-auto mb-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="text-3xl md:text-4xl mb-1">{sportIcon}</div>
            )}
            <span className="text-foreground text-xs font-medium truncate block max-w-[70px]">
              {event.awayTeam.name.split(' ').slice(-1)[0]}
            </span>
          </div>
        </div>
        
        {event.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
        
        {!event.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            {formatTime()}
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-foreground text-lg px-2 py-0.5 rounded">
          {sportIcon}
        </div>
        
        {event.channels && event.channels.length > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
            <Tv className="w-3 h-3" />
            {event.channels.length}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <p className="text-muted-foreground text-xs uppercase tracking-wide truncate mb-1">
          {event.competition}
        </p>
        
        <div className="space-y-0.5">
          <p className="text-foreground text-sm font-medium truncate">{event.homeTeam.name}</p>
          <p className="text-muted-foreground text-sm truncate">{event.awayTeam.name}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedCDN;
