import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
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
import TelegramTestButton from '../components/TelegramTestButton';

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

  // Load sports immediately on mount with optimization
  useEffect(() => {
    const loadSports = async () => {
      try {
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
              loadSports();
            }
          }, 2000);
        }
      } finally {
        setLoadingSports(false);
      }
    };

    loadSports();
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
        
        // Filter and consolidate matches to remove duplicates and combine stream sources
        const cleanMatches = filterCleanMatches(rawMatchesData);
        console.log('🧹 Clean matches:', cleanMatches.length);
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
        <title>{generateCompetitorTitle('DamiTV - Free Sports Streaming & TV Online', 'home')}</title>
        <meta name="description" content={generateCompetitorDescription('', 'home')} />
        <meta name="keywords" content="live sports streaming, watch sports online, free sports streams, sports TV, channels, live matches, free sports tv, totalsportek alternative, streameast alternative, daddylivehd alternative, crackstreams alternative" />
        <link rel="canonical" href="https://damitv.pro/" />
      </Helmet>
      
      <main className="py-4">
        {/* Banner Advertisement removed */}
        {/* <div className="mb-4 sm:mb-6">
          <Advertisement type="banner" className="w-full max-w-full overflow-hidden" />
        </div> */}

        {/* Hero/Intro: Remove "Watch Live Football Streams" headline and football-specific text */}
        {/* You may wish to add a more generic intro or simply skip it */}
        {/* Example generic intro below (feel free to adapt): */}
        {/* <section className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
            <div className="relative">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Sports & TV Channels Live Online</h1>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-2xl">
                Stream a wide variety of sports and TV events for free. No registration required.
              </p>
            </div>
          </div>
        </section> */}
        {/* This section now omitted, per your request */}

        <FeaturedMatches visibleManualMatches={visibleManualMatches} />

        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>

        {/* Telegram Test Button */}
        <div className="mb-6">
          <TelegramTestButton />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">Featured Sports</h1>
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
              <h2 className="text-xl font-bold text-foreground mb-4">Live Sports Streams</h2>
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
                        <h2 className="text-xl font-bold text-foreground">
                          Live Matches - All Sports
                        </h2>
                        <p className="text-gray-400 text-sm">
                          Currently live matches from all sports categories
                        </p>
                      </div>
                      <AllSportsLiveMatches searchTerm={searchTerm} />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-foreground">
                          {sports.find(s => s.id === selectedSport)?.name || 'Matches'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                          {filteredMatches.length} matches available
                        </p>
                      </div>
                      <MatchesList
                        matches={filteredMatches}
                        sportId={selectedSport}
                        isLoading={loadingMatches}
                        trendingSection={
                          popularMatches.length > 0 && !searchTerm.trim() ? (
                            <>
                              <PopularMatches 
                                popularMatches={popularMatches} 
                                selectedSport={selectedSport}
                              />
                              <Separator className="my-8 bg-[#343a4d]" />
                            </>
                          ) : null
                        }
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
          </>
        )}
      </main>
    </PageLayout>
  );
};

export default Index;
