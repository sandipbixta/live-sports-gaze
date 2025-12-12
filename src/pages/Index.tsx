import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Tv, ChevronRight, Radio, Users, Clock, Zap, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Match, Sport } from '../types/sports';
import { 
  fetchUnifiedMatches, 
  fetchUnifiedLiveMatches, 
  fetchSports, 
  fetchChannels,
  Channel 
} from '../services/unifiedSportsApi';
import PageLayout from '../components/PageLayout';
import TeamLogo from '../components/TeamLogo';
import { Skeleton } from '../components/ui/skeleton';
import { format } from 'date-fns';

// Sport icons
const getSportEmoji = (sport: string) => {
  const s = sport.toLowerCase();
  if (s.includes('football') || s.includes('soccer')) return '⚽';
  if (s.includes('basketball') || s === 'nba') return '🏀';
  if (s.includes('nfl') || s.includes('american')) return '🏈';
  if (s.includes('nhl') || s.includes('hockey')) return '🏒';
  if (s.includes('tennis')) return '🎾';
  if (s.includes('cricket')) return '🏏';
  if (s.includes('boxing') || s.includes('mma') || s.includes('ufc')) return '🥊';
  if (s.includes('f1') || s.includes('racing')) return '🏎️';
  return '🏆';
};

// Match Card Component
const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const home = match.teams?.home?.name || 'TBA';
  const away = match.teams?.away?.name || 'TBA';
  const isLive = match.isLive || (match.date && match.date <= Date.now() && match.date > Date.now() - 3 * 60 * 60 * 1000);
  const hasStream = match.sources?.length > 0;
  
  const getTimeDisplay = () => {
    if (isLive) return null;
    const diff = match.date - Date.now();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) return format(new Date(match.date), 'MMM d, HH:mm');
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const CardContent = (
    <div className="group card-modern p-4 cursor-pointer h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSportEmoji(match.category || '')}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate max-w-[120px]">
            {match.tournament || match.category}
          </span>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1.5 bg-live/20 text-live px-2 py-1 rounded-full">
            <span className="live-dot" />
            <span className="text-xs font-bold uppercase">Live</span>
          </div>
        ) : getTimeDisplay() && (
          <div className="flex items-center gap-1 text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-semibold">{getTimeDisplay()}</span>
          </div>
        )}
      </div>
      
      {/* Teams */}
      <div className="space-y-3">
        {/* Home */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo teamName={home} sport={match.category} size="sm" />
            <span className="font-semibold text-foreground">{home}</span>
          </div>
          {isLive && match.score?.home !== undefined && (
            <span className="text-2xl font-black text-primary tabular-nums">{match.score.home}</span>
          )}
        </div>
        
        {/* Away */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo teamName={away} sport={match.category} size="sm" />
            <span className="font-semibold text-foreground">{away}</span>
          </div>
          {isLive && match.score?.away !== undefined && (
            <span className="text-2xl font-black text-primary tabular-nums">{match.score.away}</span>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        {match.viewerCount && match.viewerCount > 0 ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{match.viewerCount.toLocaleString()}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            {!isLive && format(new Date(match.date), 'EEE, MMM d')}
          </span>
        )}
        
        {hasStream && (
          <div className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">WATCH</span>
          </div>
        )}
      </div>
    </div>
  );

  if (hasStream) {
    return (
      <Link to={`/match/${match.sportId || match.category}/${match.id}`} className="block">
        {CardContent}
      </Link>
    );
  }
  
  return CardContent;
};

// Channel Mini Card
const ChannelMini: React.FC<{ channel: Channel }> = ({ channel }) => (
  <Link
    to={`/channel/${encodeURIComponent(channel.name)}/${channel.code}`}
    className="group flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all"
  >
    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
      {channel.image ? (
        <img src={channel.image} alt={channel.name} className="w-full h-full object-contain" />
      ) : (
        <Tv className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate block">
        {channel.name}
      </span>
      {channel.viewers > 0 && (
        <span className="text-xs text-muted-foreground">{channel.viewers} watching</span>
      )}
    </div>
  </Link>
);

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allMatches, live, sportsData, channelsData] = await Promise.all([
          fetchUnifiedMatches(),
          fetchUnifiedLiveMatches(),
          fetchSports(),
          fetchChannels()
        ]);
        
        setMatches(allMatches);
        setLiveMatches(live);
        setSports(sportsData);
        setChannels(channelsData.slice(0, 8));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredMatches = useMemo(() => {
    let filtered = matches;
    if (selectedSport !== 'all') {
      filtered = matches.filter(m => 
        m.sportId === selectedSport || 
        m.category?.toLowerCase().includes(selectedSport.toLowerCase())
      );
    }
    return filtered.slice(0, 12);
  }, [matches, selectedSport]);

  const upcomingMatches = useMemo(() => 
    filteredMatches.filter(m => !m.isLive && m.date > Date.now()).slice(0, 8)
  , [filteredMatches]);

  const featuredMatch = liveMatches[0] || matches[0];

  return (
    <PageLayout>
      <Helmet>
        <title>DamiTV - Free Live Sports Streaming | Football, NBA, NFL</title>
        <meta name="description" content="Watch live sports for free in HD. Stream football, NBA, NFL, NHL and more. No signup required." />
        <link rel="canonical" href="https://www.damitv.pro/" />
      </Helmet>

      <main className="space-y-10 py-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-card border border-border/50">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/50 rounded-full blur-[120px]" />
          </div>
          
          <div className="relative p-6 md:p-10 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Text */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {liveMatches.length} Live Now
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  Watch Sports
                  <span className="text-gradient-primary block">Live & Free</span>
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-md">
                  Stream HD football, basketball, tennis and more. No registration, no fees.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Link to="/live">
                    <Button size="lg" className="btn-glow bg-primary text-primary-foreground font-bold px-8 h-12">
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Watch Live
                    </Button>
                  </Link>
                  <Link to="/channels">
                    <Button size="lg" variant="outline" className="font-bold px-6 h-12 border-border">
                      <Radio className="w-5 h-5 mr-2" />
                      TV Channels
                    </Button>
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{liveMatches.length}</p>
                    <p className="text-xs text-muted-foreground uppercase">Live Matches</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">600+</p>
                    <p className="text-xs text-muted-foreground uppercase">Channels</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">HD</p>
                    <p className="text-xs text-muted-foreground uppercase">Quality</p>
                  </div>
                </div>
              </div>
              
              {/* Right: Featured Match */}
              {featuredMatch && (
                <div className="card-modern p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {featuredMatch.tournament || featuredMatch.category || 'Featured'}
                    </span>
                    {featuredMatch.isLive && (
                      <div className="flex items-center gap-1.5 bg-live/20 text-live px-2 py-1 rounded-full">
                        <span className="live-dot" />
                        <span className="text-xs font-bold">LIVE</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between py-6">
                    <div className="text-center">
                      <TeamLogo teamName={featuredMatch.teams?.home?.name || ''} sport={featuredMatch.category} size="lg" className="mx-auto mb-3" />
                      <p className="font-bold text-foreground">{featuredMatch.teams?.home?.name || 'TBA'}</p>
                    </div>
                    
                    <div className="text-center px-4">
                      {featuredMatch.isLive && featuredMatch.score ? (
                        <div className="text-4xl font-black text-foreground">
                          <span>{featuredMatch.score.home}</span>
                          <span className="text-muted-foreground mx-2">-</span>
                          <span>{featuredMatch.score.away}</span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-muted-foreground">VS</span>
                      )}
                      {featuredMatch.progress && (
                        <p className="text-sm text-primary font-medium mt-1">{featuredMatch.progress}</p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <TeamLogo teamName={featuredMatch.teams?.away?.name || ''} sport={featuredMatch.category} size="lg" className="mx-auto mb-3" />
                      <p className="font-bold text-foreground">{featuredMatch.teams?.away?.name || 'TBA'}</p>
                    </div>
                  </div>
                  
                  {featuredMatch.sources?.length > 0 && (
                    <Link to={`/match/${featuredMatch.sportId || featuredMatch.category}/${featuredMatch.id}`}>
                      <Button className="w-full btn-glow bg-primary text-primary-foreground font-bold">
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        {featuredMatch.isLive ? 'Watch Live' : 'Watch Now'}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sports Filter */}
        <section>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <button
              onClick={() => setSelectedSport('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                selectedSport === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              <Globe className="w-4 h-4" />
              All Sports
            </button>
            {sports.slice(0, 8).map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedSport === sport.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <span>{getSportEmoji(sport.id)}</span>
                {sport.name}
              </button>
            ))}
          </div>
        </section>

        {/* Live Now */}
        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="live-dot" />
                <h2 className="section-title">Live Now</h2>
                <span className="px-2 py-0.5 bg-live/20 text-live text-sm font-bold rounded-full">
                  {liveMatches.length}
                </span>
              </div>
              <Link to="/live" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liveMatches.slice(0, 4).map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming</h2>
            <Link to="/schedule" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
              Full Schedule <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        {/* Channels */}
        {channels.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="section-title">Live TV</h2>
              </div>
              <Link to="/channels" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                All Channels <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {channels.map(channel => (
                <ChannelMini key={channel.name} channel={channel} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-4">
            Start Streaming Now
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
            Free HD sports streaming. All major leagues. No signup required.
          </p>
          <Link to="/live">
            <Button size="lg" className="bg-primary-foreground text-primary font-bold px-8 h-12 hover:bg-primary-foreground/90">
              <Play className="w-5 h-5 mr-2 fill-current" />
              Watch Free
            </Button>
          </Link>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
