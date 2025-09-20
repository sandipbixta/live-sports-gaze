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
import FeaturedSports from '../components/FeaturedSports';
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
        <title>DamiTV - Free Live Sports Streaming Online | Watch Football & More</title>
        <meta name="description" content="Watch free live sports streaming online at DamiTV. Access football, basketball, tennis matches and TV channels without registration. HD quality streams." />
        <meta name="keywords" content="live sports streaming, watch sports online, free sports streams, sports TV, channels, live matches, free sports tv, totalsportek alternative, streameast alternative" />
        <link rel="canonical" href="https://www.damitv.pro/" />
      </Helmet>
      
      <main className="py-4">

        <FeaturedMatches visibleManualMatches={visibleManualMatches} />

        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Featured Sports</h2>
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
              <h3 className="text-xl font-bold text-foreground mb-4">Live Sports Streams</h3>
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
                        <h3 className="text-xl font-bold text-foreground">
                          Live Matches - All Sports
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Currently live matches from all sports categories
                        </p>
                      </div>
                      <AllSportsLiveMatches searchTerm={searchTerm} limitFootballMatches={true} />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-foreground">
                          {sports.find(s => s.id === selectedSport)?.name || 'Matches'}
                        </h3>
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
            
            {/* Hero Section */}
            <section className="mb-6 sm:mb-8 mt-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
                <div className="relative">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Free Live Sports Streaming Online</h1>
                  <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
                    Watch live sports streaming for free at DamiTV. Access football, basketball, tennis matches and hundreds of TV channels without registration. HD quality streams available on all devices.
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

            {/* Introduction Content */}
            <section className="mb-8">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-semibold text-foreground mb-4">About DamiTV Sports Streaming</h2>
                <p className="text-muted-foreground mb-4">
                  DamiTV offers the best free live sports streaming experience online. Our platform provides access to live football matches, basketball games, tennis tournaments, and hundreds of sports TV channels from around the world. Watch your favorite teams and athletes compete in real-time without any subscription fees or registration requirements.
                </p>
                <p className="text-muted-foreground mb-4">
                  Whether you're looking for <Link to="/live" className="text-blue-400 hover:underline">live sports matches</Link>, want to browse our extensive <Link to="/channels" className="text-blue-400 hover:underline">TV channels collection</Link>, or check upcoming games in our <Link to="/schedule" className="text-blue-400 hover:underline">sports schedule</Link>, DamiTV has you covered with high-quality streaming that works on desktop, mobile, and tablet devices.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </PageLayout>
  );
};

export default Index;
