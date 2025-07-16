import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import PopularMatches from '../components/PopularMatches';
import LiveSportsWidget from '../components/LiveSportsWidget';
import FeaturedMatches from '../components/FeaturedMatches';
import AnnouncementBanner from '../components/AnnouncementBanner';
import PromotionBoxes from '../components/PromotionBoxes';
import { Separator } from '../components/ui/separator';
import { Calendar, Tv } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import { isPopularLeague } from '../utils/popularLeagues';
import { Helmet } from 'react-helmet-async';
import { manualMatches } from '../data/manualMatches';

// Lazy load heavy components
const NewsSection = React.lazy(() => import('../components/NewsSection'));
const FeaturedChannels = React.lazy(() => import('../components/FeaturedChannels'));

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

  // Memoize popular matches calculation
  const popularMatches = useMemo(() => {
    return matches.filter(match => 
      isPopularLeague(match.title) && 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news')
    );
  }, [matches]);

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
        
        // Sort with football first for better UX
        sportsData = sportsData.sort((a, b) => {
          if (a.name.toLowerCase() === 'football') return -1;
          if (b.name.toLowerCase() === 'football') return 1;
          if (a.name.toLowerCase() === 'basketball') return -1;
          if (b.name.toLowerCase() === 'basketball') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setSports(sportsData);
        
        // Auto-select football for faster initial load
        if (sportsData.length > 0) {
          const footballSport = sportsData.find(s => s.name.toLowerCase() === 'football');
          if (footballSport) {
            handleSelectSport(footballSport.id);
          } else {
            handleSelectSport(sportsData[0].id);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load sports data.",
          variant: "destructive",
        });
      } finally {
        setLoadingSports(false);
      }
    };

    loadSports();
  }, [toast]);

  // Optimized search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Optimized sport selection with caching
  const handleSelectSport = async (sportId: string) => {
    if (selectedSport === sportId) return;
    
    setSelectedSport(sportId);
    setLoadingMatches(true);
    
    try {
      if (allMatches[sportId]) {
        setMatches(allMatches[sportId]);
      } else {
        const matchesData = await fetchMatches(sportId);
        setMatches(matchesData);
        
        setAllMatches(prev => ({
          ...prev,
          [sportId]: matchesData
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load matches data.",
        variant: "destructive",
      });
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>DamiTV - Free Sports Streaming & TV Online</title>
        <meta name="description" content="Enjoy a wide variety of live sports and free TV channels online on DamiTV. Stream all your favorite sports events and tournaments with no registration required." />
        <meta name="keywords" content="live sports streaming, watch sports online, free sports streams, sports TV, channels, live matches, free sports tv" />
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

        {/* Direct Link Advertisement removed */}
        {/* <div className="mb-4 sm:mb-6">
          <Advertisement type="direct-link" className="w-full" />
        </div> */}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Featured Sports</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent"
                onClick={() => setShowLiveSports(!showLiveSports)}
              >
                <Tv className="mr-2 h-4 w-4" /> 
                {showLiveSports ? 'Hide Live Sports' : 'Live Sports'}
              </Button>
              <Link to="/schedule">
                <Button variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" /> View Schedule
                </Button>
              </Link>
            </div>
          </div>
          
          {showLiveSports ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Live Sports Streams</h2>
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
            <AnnouncementBanner />
            
            <React.Suspense fallback={<div className="h-32 bg-[#242836] rounded-lg animate-pulse" />}>
              <FeaturedChannels />
            </React.Suspense>
            
            <Separator className="my-8 bg-[#343a4d]" />
            
            {popularMatches.length > 0 && (
              <>
                <PopularMatches 
                  popularMatches={popularMatches} 
                  selectedSport={selectedSport}
                />
                <Separator className="my-8 bg-[#343a4d]" />
              </>
            )}
            
            <div className="mb-8">
              {(selectedSport || loadingMatches) && (
                <MatchesList
                  matches={filteredMatches}
                  sportId={selectedSport || ""}
                  isLoading={loadingMatches}
                />
              )}
            </div>
            
            <div className="mb-8">
              <React.Suspense fallback={<div className="h-48 bg-[#242836] rounded-lg animate-pulse" />}>
                <NewsSection />
              </React.Suspense>
            </div>
            
            <PromotionBoxes />
          </>
        )}
      </main>
    </PageLayout>
  );
};

export default Index;
