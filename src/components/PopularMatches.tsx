import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ChevronRight, Play } from 'lucide-react';
import { 
  getFeaturedMatches, 
  isMatchLive, 
  formatMatchTime,
  WeStreamMatch 
} from '../services/weStreamService';

// Sport icons
const SPORT_ICONS: Record<string, string> = {
  football: '⚽', soccer: '⚽', basketball: '🏀', nba: '🏀',
  nfl: '🏈', 'american-football': '🏈', hockey: '🏒', nhl: '🏒',
  baseball: '⚾', mlb: '⚾', tennis: '🎾', cricket: '🏏',
  rugby: '🏉', mma: '🥊', ufc: '🥊', fighting: '🥊', boxing: '🥊',
  wrestling: '🤼', wwe: '🤼', motorsport: '🏎️', f1: '🏎️',
  motogp: '🏍️', afl: '🏉', golf: '⛳', darts: '🎯', default: '🏆'
};

const getSportIcon = (sport: string): string => {
  const key = sport?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
  return SPORT_ICONS[key] || SPORT_ICONS.default;
};

// Sport colors for gradient backgrounds
const SPORT_COLORS: Record<string, string> = {
  football: 'from-green-900 to-green-950',
  soccer: 'from-green-900 to-green-950',
  basketball: 'from-orange-900 to-orange-950',
  nba: 'from-orange-900 to-orange-950',
  nfl: 'from-blue-900 to-blue-950',
  hockey: 'from-cyan-900 to-cyan-950',
  nhl: 'from-cyan-900 to-cyan-950',
  baseball: 'from-red-900 to-red-950',
  tennis: 'from-lime-900 to-lime-950',
  cricket: 'from-emerald-900 to-emerald-950',
  mma: 'from-red-900 to-red-950',
  ufc: 'from-red-900 to-red-950',
  boxing: 'from-red-900 to-red-950',
  f1: 'from-red-900 to-red-950',
  motorsport: 'from-gray-800 to-gray-900',
  default: 'from-gray-800 to-gray-900'
};

const getSportGradient = (sport: string): string => {
  const key = sport?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
  return SPORT_COLORS[key] || SPORT_COLORS.default;
};

const PopularMatches = () => {
  const [matches, setMatches] = useState<WeStreamMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getFeaturedMatches(12);
        setMatches(data);
      } catch (error) {
        console.error('Failed to fetch popular matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">POPULAR</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl h-44 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground">POPULAR</h2>
          <span className="text-muted-foreground text-sm ml-2">Top matches right now</span>
        </div>
        <Link 
          to="/live"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {matches.map((match) => (
          <PopularMatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
};

// Match Card Component
const PopularMatchCard = ({ match }: { match: WeStreamMatch }) => {
  const sportIcon = getSportIcon(match.category);
  const sportGradient = getSportGradient(match.category);
  const live = isMatchLive(match);
  const homeTeam = match.teams?.home?.name || 'TBD';
  const awayTeam = match.teams?.away?.name || 'TBD';

  return (
    <Link
      to={`/match/${match.category}/${match.id}`}
      className="group relative bg-card rounded-xl overflow-hidden hover:ring-2 hover:ring-primary hover:scale-[1.02] transition-all duration-300"
    >
      {/* Background Gradient */}
      <div className={`h-28 md:h-32 bg-gradient-to-br ${sportGradient} relative overflow-hidden`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
          }} />
        </div>
        
        {/* Large sport icon watermark */}
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-20 transform rotate-12">
          {sportIcon}
        </div>
        
        {/* Teams Display */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{sportIcon}</div>
            <span className="text-white text-xs font-medium truncate block max-w-[80px]">
              {homeTeam.split(' ').slice(-1)[0]}
            </span>
          </div>
          <span className="text-white/60 text-sm font-bold">VS</span>
          <div className="text-center">
            <div className="text-3xl mb-1">{sportIcon}</div>
            <span className="text-white text-xs font-medium truncate block max-w-[80px]">
              {awayTeam.split(' ').slice(-1)[0]}
            </span>
          </div>
        </div>
        
        {/* Live Badge */}
        {live && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
        
        {/* Time Badge */}
        {!live && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            {formatMatchTime(match.date)}
          </div>
        )}
        
        {/* Popular Badge */}
        {match.popular && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
            🔥
          </div>
        )}
        
        {/* Play button on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="p-3 bg-card">
        {/* Category */}
        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1.5">
          {match.category}
        </p>
        
        {/* Teams */}
        <div className="space-y-0.5">
          <p className="text-foreground text-sm font-medium truncate">{homeTeam}</p>
          <p className="text-muted-foreground text-sm truncate">{awayTeam}</p>
        </div>
      </div>
    </Link>
  );
};

export default PopularMatches;
