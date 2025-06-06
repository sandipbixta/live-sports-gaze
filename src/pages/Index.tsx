
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import PopularMatches from '../components/PopularMatches';
import { Separator } from '../components/ui/separator';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageLayout from '../components/PageLayout';
import { isPopularLeague } from '../utils/popularLeagues';
import { Helmet } from 'react-helmet-async';

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
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);

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

  // Optimized fetch sports function
  const loadSports = useCallback(async () => {
    setLoadingSports(true);
    
    try {
      let sportsData = await fetchSports();
      
      if (!sportsData || sportsData.length === 0) {
        throw new Error('No sports data received');
      }
      
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
      console.error('Error loading sports:', error);
      toast({
        title: "Data Loading Issue",
        description: "We're having trouble loading sports data. Trying to recover...",
        variant: "destructive",
      });
      
      // Try to use fallback data
      const fallbackSports = [
        { id: '1', name: 'Football' },
        { id: '2', name: 'Basketball' }
      ];
      
      setSports(fallbackSports);
      handleSelectSport('1'); // Default to football
      
    } finally {
      setLoadingSports(false);
    }
  }, [toast]);

  // Load sports immediately on mount with optimization and retry mechanism
  useEffect(() => {
    loadSports();
  }, [loadSports, retryCounter]);

  // Optimized search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Optimized sport selection with caching
  const handleSelectSport = async (sportId: string) => {
    if (selectedSport === sportId) return; // Avoid unnecessary re-fetch
    
    setSelectedSport(sportId);
    setLoadingMatches(true);
    
    try {
      // Check cache first
      if (allMatches[sportId]) {
        setMatches(allMatches[sportId]);
      } else {
        const matchesData = await fetchMatches(sportId);
        
        if (matchesData && matchesData.length > 0) {
          setMatches(matchesData);
          
          // Cache the data
          setAllMatches(prev => ({
            ...prev,
            [sportId]: matchesData
          }));
        } else {
          // Handle empty matches case
          setMatches([]);
          toast({
            title: "No Matches Found",
            description: "No matches are currently available for this sport.",
          });
        }
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches data. Please try again.",
        variant: "destructive",
      });
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setRetryCounter(prev => prev + 1);
    toast({
      title: "Retrying",
      description: "Attempting to reload sports and matches data...",
    });
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>DamiTV - Watch Live Football & Sports Streams | Free Football Streaming</title>
        <meta name="description" content="Watch free live football streams, soccer matches, and sports TV online on DamiTV. Access hundreds of free sports streaming channels with no registration required." />
        <meta name="keywords" content="live football streaming, watch football online, free sports streams, live matches today, free football tv" />
        <link rel="canonical" href="https://damitv.pro/" />
      </Helmet>
      
      <main className="py-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Featured Sports</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry} 
                className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
              </Button>
              <Link to="/schedule">
                <Button variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" /> View Schedule
                </Button>
              </Link>
            </div>
          </div>
          <SportsList 
            sports={sports}
            onSelectSport={handleSelectSport}
            selectedSport={selectedSport}
            isLoading={loadingSports}
          />
        </div>
        
        {/* Quick announcement - optimized */}
        <div className="mb-6 bg-gradient-to-r from-[#ff5a36] to-[#e64d2e] rounded-lg p-1 overflow-hidden">
          <div className="bg-[#0A0F1C] rounded-md p-3">
            <div className="overflow-hidden whitespace-nowrap">
              <div className="animate-marquee inline-block text-white font-medium">
                🔴 IF YOU CAN'T FIND YOUR MATCH PLEASE VISIT THE LIVE SPORTS CHANNELS SECTION 📺
              </div>
            </div>
          </div>
        </div>
        
        {/* Lazy load featured channels */}
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
          
          {!loadingMatches && filteredMatches.length === 0 && selectedSport && (
            <div className="bg-[#242836] rounded-xl p-6 text-center">
              <p className="text-gray-300 mb-4">No matches found for this sport right now.</p>
              <Button onClick={handleRetry} className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
              </Button>
            </div>
          )}
        </div>
        
        {/* Lazy load news section */}
        <div className="mb-8">
          <React.Suspense fallback={<div className="h-48 bg-[#242836] rounded-lg animate-pulse" />}>
            <NewsSection />
          </React.Suspense>
        </div>
        
        {/* Promotion boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-[#242836] rounded-xl p-6 border border-[#343a4d]">
            <h2 className="text-xl font-bold mb-4 text-white">Live Now</h2>
            <p className="text-gray-300">Discover events happening right now across different sports.</p>
            <Link to="/live" aria-label="View all live sports events">
              <Button variant="link" className="mt-4 text-[#9b87f5]">See all live events →</Button>
            </Link>
          </div>
          
          <div className="bg-[#242836] rounded-xl p-6 border border-[#343a4d]">
            <h2 className="text-xl font-bold mb-4 text-white">Coming Up</h2>
            <p className="text-gray-300">Get ready for upcoming matches and tournaments.</p>
            <Link to="/schedule" aria-label="View upcoming matches schedule">
              <Button variant="link" className="mt-4 text-[#9b87f5]">See schedule →</Button>
            </Link>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default Index;
