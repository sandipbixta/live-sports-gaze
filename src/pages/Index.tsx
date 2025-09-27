import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches, fetchLiveMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, filterActiveMatches } from '../utils/matchUtils';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import PopularMatches from '../components/PopularMatches';
import LiveSportsWidget from '../components/LiveSportsWidget';
import FeaturedMatches from '../components/FeaturedMatches';
import AllSportsLiveMatches from '../components/AllSportsLiveMatches';

import PromotionBoxes from '../components/PromotionBoxes';
import { Separator } from '../components/ui/separator';
import { Calendar, Tv } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import { isPopularLeague } from '../utils/popularLeagues';
import { generateCompetitorTitle, generateCompetitorDescription } from '../utils/competitorSEO';
import CompetitorSEOContent from '../components/CompetitorSEOContent';
import { Helmet } from 'react-helmet-async';
import { manualMatches } from '../data/manualMatches';
import TelegramBanner from '../components/TelegramBanner';

// Lazy load heavy components
const NewsSection = React.lazy(() => import('../components/NewsSection'));
const FeaturedChannels = React.lazy(() => import('../components/FeaturedChannels'));
const TrendingTopics = React.lazy(() => import('../components/TrendingTopics'));

const Index = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<{[sportId: string]: Match[]}>({});
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLiveSports, setShowLiveSports] = useState(false);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Filter visible manual matches
  const visibleManualMatches = useMemo(() => {
    return manualMatches.filter(match => match.visible);
  }, []);

  // Memoize popular matches calculation - exclude ended matches and filter by selected sport
  const popularMatches = useMemo(() => {
    // If "All Sports" is selected, don't show popular matches section to avoid duplication
    if (selectedSport === 'all') {
      return [];
    }
    
    const activeMatches = filterActiveMatches(matches);
    return activeMatches.filter(match => 
      isPopularLeague(match.title) && 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news')
    );
  }, [matches, selectedSport]);

  // Memoize filtered matches
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return matches.filter(match => {
      return match.title.toLowerCase().includes(lowercaseSearch) || 
        match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
    });
  }, [matches, searchTerm]);

  // Load sports and live matches immediately on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load sports
        let sportsData = await fetchSports();
        console.log('📊 Sports data loaded:', sportsData);
        
        // Sort with football first for better UX
        sportsData = sportsData.sort((a, b) => {
          if (a.name.toLowerCase() === 'football') return -1;
          if (b.name.toLowerCase() === 'football') return 1;
          if (a.name.toLowerCase() === 'basketball') return -1;
          if (b.name.toLowerCase() === 'basketball') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setSports(sportsData);
        console.log('✅ Sports state updated');

        // Load live matches for featured sections
        try {
          console.log('🔴 Loading live matches...');
          const liveMatchesData = await fetchLiveMatches();
          // Filter out ended matches from live matches
          const activeLiveMatches = filterActiveMatches(liveMatchesData);
          setLiveMatches(activeLiveMatches);
          console.log(`✅ Loaded ${activeLiveMatches.length} active live matches`);
        } catch (error) {
          console.error('Error loading live matches:', error);
        }
        
      } catch (error) {
        console.error('Sports loading error:', error);
        
        // Only show error if we don't have any sports data at all
        if (sports.length === 0) {
          toast({
            title: "Connection Issue",
            description: "Slow connection detected. Retrying...",
            variant: "destructive",
          });
          
          // Retry after a short delay on mobile
          setTimeout(() => {
            if (sports.length === 0) {
              loadInitialData();
            }
          }, 2000);
        }
      } finally {
        setLoadingSports(false);
      }
    };

    loadInitialData();
  }, []);

  // Separate useEffect for handling sport auto-selection to avoid dependency issues
  useEffect(() => {
    if (sports.length > 0 && !selectedSport && !loadingSports) {
      console.log('🏈 Auto-selecting "All Sports" as default');
      setSelectedSport('all');
    }
  }, [sports, selectedSport, loadingSports]);

  // Optimized search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Optimized sport selection with caching
  const handleSelectSport = async (sportId: string) => {
    console.log(`🎯 Selecting sport: ${sportId}, current: ${selectedSport}`);
    if (selectedSport === sportId) return;
    
    setSelectedSport(sportId);
    
    // For "All Sports", we don't need to load specific matches
    // as AllSportsLiveMatches component handles its own data fetching
    if (sportId === 'all') {
      setMatches([]);
      return;
    }
    
    setLoadingMatches(true);
    console.log('🔄 Loading matches for sport:', sportId);
    
    try {
      if (allMatches[sportId]) {
        console.log('📁 Using cached matches:', allMatches[sportId].length);
        setMatches(allMatches[sportId]);
      } else {
        const rawMatchesData = await fetchMatches(sportId);
        console.log('📥 Raw matches data:', rawMatchesData.length);
        
        // Filter and consolidate matches to remove duplicates, ended matches, and combine stream sources
        const cleanMatches = filterActiveMatches(filterCleanMatches(rawMatchesData));
        console.log('🧹 Clean active matches:', cleanMatches.length);
        const consolidatedMatches = consolidateMatches(cleanMatches);
        console.log('🔗 Consolidated matches:', consolidatedMatches.length);
        
        setMatches(consolidatedMatches);
        
        setAllMatches(prev => ({
          ...prev,
          [sportId]: consolidatedMatches
        }));
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches data.",
        variant: "destructive",
      });
    } finally {
      setLoadingMatches(false);
      console.log('✅ Finished loading matches');
    }
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>DamiTV - Free Live Sports Streaming | Football TV</title>
        <meta name="description" content="Watch free live sports streaming at DamiTV. Football, basketball, tennis matches and TV channels. No registration required." />
        <meta name="keywords" content="live sports streaming, watch sports online, free sports streams, sports TV, channels, live matches, free sports tv, totalsportek alternative, streameast alternative" />
        <link rel="canonical" href="https://www.damitv.pro/" />
      </Helmet>
      
      <main className="py-4">
        {/* SEO Content - Always Visible */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-3">Free Live Sports Streaming Online - DamiTV</h1>
          <p className="text-lg text-muted-foreground max-w-4xl mb-4">
            Watch live sports streaming for free at DamiTV. Access football matches, basketball games, tennis tournaments, and hundreds of sports TV channels from around the world without registration.
          </p>
          
          {/* Static SEO Content - Always Rendered */}
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-muted-foreground mb-3">
              DamiTV provides comprehensive <strong>live sports streaming</strong> coverage including Premier League football, Champions League matches, NBA basketball, tennis tournaments, and boxing events. Our platform offers multiple streaming sources with HD quality for reliable viewing experience across all devices.
            </p>
            <p className="text-muted-foreground mb-4">
              Navigate through our extensive collection: browse <Link to="/live" className="text-blue-400 hover:underline font-medium">live matches</Link>, explore <Link to="/channels" className="text-blue-400 hover:underline font-medium">TV channels</Link>, check the <Link to="/schedule" className="text-blue-400 hover:underline font-medium">sports schedule</Link>, or read the latest <Link to="/news" className="text-blue-400 hover:underline font-medium">sports news</Link>. All content is free and requires no registration.
            </p>
          </div>
        </header>

        <FeaturedMatches visibleManualMatches={visibleManualMatches} />

        {/* Static SEO Navigation - Always Visible */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-lg font-bold text-foreground mb-2">Popular Sports</h2>
              <div className="space-y-2 text-sm">
                <Link to="/live?sport=football" className="block text-blue-400 hover:underline">⚽ Live Football Streaming</Link>
                <Link to="/live?sport=basketball" className="block text-blue-400 hover:underline">🏀 NBA Basketball Games</Link>
                <Link to="/live?sport=tennis" className="block text-blue-400 hover:underline">🎾 Tennis Tournaments</Link>
                <Link to="/live?sport=boxing" className="block text-blue-400 hover:underline">🥊 Boxing & MMA Events</Link>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-lg font-bold text-foreground mb-2">Popular Leagues</h2>
              <div className="space-y-2 text-sm">
                <Link to="/live?league=premier-league" className="block text-blue-400 hover:underline">🏆 Premier League</Link>
                <Link to="/live?league=champions-league" className="block text-blue-400 hover:underline">⭐ Champions League</Link>
                <Link to="/live?league=la-liga" className="block text-blue-400 hover:underline">🇪🇸 La Liga</Link>
                <Link to="/live?league=serie-a" className="block text-blue-400 hover:underline">🇮🇹 Serie A</Link>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-lg font-bold text-foreground mb-2">Quick Access</h2>
              <div className="space-y-2 text-sm">
                <Link to="/channels" className="block text-blue-400 hover:underline">📺 Sports TV Channels</Link>
                <Link to="/schedule" className="block text-blue-400 hover:underline">📅 Today's Schedule</Link>
                <Link to="/news" className="block text-blue-400 hover:underline">📰 Sports News</Link>
                <Link to="/live" className="block text-blue-400 hover:underline">🔴 All Live Streams</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>

        {/* Static SEO Content Section - Always Visible */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Choose DamiTV for Live Sports Streaming?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Free HD Sports Streaming</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Experience high-definition live sports streaming completely free. Watch Premier League football, Champions League matches, NBA basketball, tennis Grand Slams, and boxing events without any subscription fees or registration requirements.
              </p>
              <p className="text-muted-foreground text-sm">
                Our advanced streaming technology provides multiple backup sources for each event, ensuring uninterrupted viewing even during peak traffic periods. Compatible with all devices including smartphones, tablets, and smart TVs.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Comprehensive Sports Coverage</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Access over 100+ sports channels and thousands of live matches across all major leagues worldwide. From European football leagues like Premier League, La Liga, Serie A, to American sports including NFL, NBA, MLB, and international tournaments.
              </p>
              <p className="text-muted-foreground text-sm">
                Stay updated with live scores, match highlights, team statistics, and expert analysis. Our platform covers both popular and niche sports to cater to all sports enthusiasts globally.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-foreground">Featured Sports</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-foreground border-border hover:bg-muted bg-background"
                onClick={() => setShowLiveSports(!showLiveSports)}
              >
                <Tv className="mr-2 h-4 w-4" /> 
                {showLiveSports ? 'Hide Live Sports' : 'Live Sports'}
              </Button>
              <Link to="/schedule">
                <Button variant="outline" className="text-foreground border-border hover:bg-muted bg-background">
                  <Calendar className="mr-2 h-4 w-4" /> View Schedule
                </Button>
              </Link>
            </div>
          </div>
          
          {showLiveSports ? (
            <div className="mb-8">
              <h4 className="text-xl font-bold text-foreground mb-4">Live Sports Streams</h4>
              <LiveSportsWidget />
            </div>
          ) : (
            <SportsList 
              sports={sports}
              onSelectSport={handleSelectSport}
              selectedSport={selectedSport}
              isLoading={loadingSports}
            />
          )}
        </div>
        
        {!showLiveSports && (
          <>
            
            
            <React.Suspense fallback={<div className="h-32 bg-[#242836] rounded-lg animate-pulse" />}>
              <FeaturedChannels />
            </React.Suspense>
            
            <Separator className="my-8 bg-[#343a4d]" />
            
            
            <div className="mb-8">
              {selectedSport && (
                <>
                  {selectedSport === 'all' ? (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-foreground">
                          Live Matches - All Sports
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Currently live matches from all sports categories
                        </p>
                      </div>
                      <AllSportsLiveMatches searchTerm={searchTerm} />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-foreground">
                          {sports.find(s => s.id === selectedSport)?.name || 'Matches'}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {filteredMatches.length} matches available
                        </p>
                      </div>
                      <MatchesList
                        matches={filteredMatches}
                        sportId={selectedSport}
                        isLoading={loadingMatches}
                      />
                    </>
                  )}
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <React.Suspense fallback={<div className="h-48 bg-[#242836] rounded-lg animate-pulse" />}>
                  <NewsSection />
                </React.Suspense>
              </div>
              <div>
                <React.Suspense fallback={<div className="h-48 bg-[#242836] rounded-lg animate-pulse" />}>
                  <TrendingTopics />
                </React.Suspense>
              </div>
            </div>
            
            <PromotionBoxes />
            
            {/* Hidden SEO content for competitor targeting */}
            <CompetitorSEOContent showFAQ={true} showCompetitorMentions={true} />
            
            {/* Call to Action Section */}
            <section className="mb-6 sm:mb-8 mt-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
                <div className="relative">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Start Watching Sports Now</h2>
                  <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
                    Join thousands of sports fans who trust DamiTV for free live streaming. Access all major leagues and tournaments with crystal clear HD quality on any device.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/live">
                      <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                        <Tv className="mr-2 h-4 w-4" /> Watch Live Sports
                      </Button>
                    </Link>
                    <Link to="/channels">
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                        <Calendar className="mr-2 h-4 w-4" /> Browse Channels
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* SEO Content Section - Compact and organized */}
            <section className="mb-8">
              <div className="prose prose-invert max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Popular Sports Available</h2>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Live Football Streaming (Premier League, Champions League, La Liga)</li>
                      <li>• Basketball Games (NBA, EuroLeague)</li>
                      <li>• Tennis Tournaments (ATP, WTA, Grand Slams)</li>
                      <li>• Boxing and MMA Events</li>
                      <li>• Motor Sports (Formula 1, MotoGP)</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Why Choose DamiTV?</h2>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• No registration or subscription required</li>
                      <li>• HD quality streaming on all devices</li>
                      <li>• Multiple streaming sources for reliability</li>
                      <li>• Live chat and match discussions</li>
                      <li>• Regular updates and new channels</li>
                    </ul>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">How DamiTV Works</h3>
                    <p className="text-muted-foreground mb-3 text-sm">
                      DamiTV provides free access to live sports streaming through our user-friendly platform. Simply browse our sports categories, select your preferred match or channel, and start watching instantly. No downloads, no registration, and no hidden fees.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Our streaming technology ensures reliable connections with multiple backup sources for each event. If one stream experiences issues, our system automatically switches to an alternative source to maintain uninterrupted viewing.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Comprehensive Sports Coverage</h3>
                    <p className="text-muted-foreground mb-3 text-sm">
                      We cover major sports leagues worldwide including Premier League football, Champions League, NBA basketball, ATP tennis, Formula 1 racing, and boxing events. Our coverage spans European football leagues, American sports, and international tournaments.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Whether you're looking for <Link to="/live" className="text-blue-400 hover:underline">live sports matches</Link>, want to browse our extensive <Link to="/channels" className="text-blue-400 hover:underline">TV channels collection</Link>, or check upcoming games in our <Link to="/schedule" className="text-blue-400 hover:underline">sports schedule</Link>, DamiTV provides comprehensive sports entertainment.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </PageLayout>
  );
};

export default Index;
