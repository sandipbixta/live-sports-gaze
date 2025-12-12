import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Tv, Calendar, ChevronRight, Radio } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Match, Sport } from '../types/sports';
import { 
  fetchUnifiedMatches, 
  fetchUnifiedLiveMatches, 
  fetchSports, 
  fetchChannels,
  fetchFeaturedMatches,
  Channel 
} from '../services/unifiedSportsApi';
import PageLayout from '../components/PageLayout';
import HeroSection from '../components/HeroSection';
import LiveMatchCard from '../components/LiveMatchCard';
import SportsPillNav from '../components/SportsPillNav';
import QuickStats from '../components/QuickStats';
import { Skeleton } from '../components/ui/skeleton';

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [allMatches, live, featured, sportsData, channelsData] = await Promise.all([
          fetchUnifiedMatches(),
          fetchUnifiedLiveMatches(),
          fetchFeaturedMatches(8),
          fetchSports(),
          fetchChannels()
        ]);
        
        setMatches(allMatches);
        setLiveMatches(live);
        setFeaturedMatches(featured);
        setSports(sportsData);
        setChannels(channelsData.slice(0, 12));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter matches by sport
  const filteredMatches = useMemo(() => {
    if (selectedSport === 'all') return matches.slice(0, 16);
    return matches.filter(m => 
      m.sportId === selectedSport || 
      m.category?.toLowerCase().includes(selectedSport.toLowerCase())
    ).slice(0, 16);
  }, [matches, selectedSport]);

  const filteredLiveMatches = useMemo(() => {
    if (selectedSport === 'all') return liveMatches;
    return liveMatches.filter(m => 
      m.sportId === selectedSport || 
      m.category?.toLowerCase().includes(selectedSport.toLowerCase())
    );
  }, [liveMatches, selectedSport]);

  return (
    <PageLayout>
      <Helmet>
        <title>DamiTV - Free Live Sports Streaming | Watch Football, NBA, NFL Online</title>
        <meta name="description" content="Watch live sports for free. Stream football, NBA, NFL, NHL and more in HD quality. No signup required." />
        <link rel="canonical" href="https://www.damitv.pro/" />
      </Helmet>

      <main className="space-y-8 py-6">
        {/* Hero Section */}
        <section>
          {loading ? (
            <Skeleton className="h-[400px] md:h-[500px] rounded-2xl" />
          ) : (
            <HeroSection matches={featuredMatches} />
          )}
        </section>

        {/* Quick Stats */}
        <section>
          <QuickStats 
            liveMatchesCount={liveMatches.length}
            channelsCount={channels.length}
            viewersCount={liveMatches.reduce((acc, m) => acc + (m.viewerCount || 0), 0)}
          />
        </section>

        {/* Sports Filter */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">Browse Sports</h2>
          </div>
          <SportsPillNav 
            sports={sports}
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
          />
        </section>

        {/* Live Matches */}
        {filteredLiveMatches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-live rounded-full animate-pulse" />
                <h2 className="text-xl font-bold font-display text-foreground">Live Now</h2>
                <span className="text-sm text-muted-foreground">({filteredLiveMatches.length})</span>
              </div>
              <Link to="/live" className="flex items-center gap-1 text-sm text-primary hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLiveMatches.slice(0, 8).map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">Upcoming Matches</h2>
            <Link to="/schedule" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Full Schedule <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMatches.filter(m => !m.isLive).slice(0, 8).map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Channels */}
        {channels.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold font-display text-foreground">Live TV Channels</h2>
              </div>
              <Link to="/channels" className="flex items-center gap-1 text-sm text-primary hover:underline">
                All Channels <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {channels.slice(0, 12).map((channel) => (
                <Link
                  key={channel.name}
                  to={`/channel/${encodeURIComponent(channel.name)}/${channel.code}`}
                  className="group flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-2 overflow-hidden">
                    {channel.image ? (
                      <img src={channel.image} alt={channel.name} className="w-full h-full object-contain" />
                    ) : (
                      <Tv className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full group-hover:text-primary transition-colors">
                    {channel.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-primary-foreground mb-3">
              Watch Sports Anywhere, Anytime
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl">
              Stream live football, basketball, tennis and more in HD quality. No registration needed.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/live">
                <Button className="bg-background text-foreground hover:bg-background/90 font-bold">
                  <Play className="w-4 h-4 mr-2 fill-current" /> Watch Live
                </Button>
              </Link>
              <Link to="/channels">
                <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Tv className="w-4 h-4 mr-2" /> Browse Channels
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Index;
