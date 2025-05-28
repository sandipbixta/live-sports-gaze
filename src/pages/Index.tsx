
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import PopularMatches from '../components/PopularMatches';
import { Separator } from '../components/ui/separator';
import { Calendar, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import PageLayout from '../components/PageLayout';
import { isPopularLeague } from '../utils/popularLeagues';
import Advertisement from '../components/Advertisement';
import { Helmet } from 'react-helmet-async';
import NewsSection from '../components/NewsSection';
import FeaturedChannels from '../components/FeaturedChannels';

const Index = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [popularMatches, setPopularMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<{[sportId: string]: Match[]}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Ad loading effect
  useEffect(() => {
    console.log('Initializing ads...');
    
    // Clean up any existing ads and scripts
    const existingScripts = document.querySelectorAll('script[src*="monkeyhundredsarmed.com"]') as NodeListOf<HTMLScriptElement>;
    existingScripts.forEach(script => {
      console.log('Removing existing script:', script.src);
      script.remove();
    });

    // Clear existing ad containers
    const bannerContainer = document.getElementById('banner-ad-container');
    const secondAdContainer = document.getElementById('ad-container-2');
    
    if (bannerContainer) {
      bannerContainer.innerHTML = '';
    }
    if (secondAdContainer) {
      secondAdContainer.innerHTML = '';
    }

    // Load banner ad with iframe format
    const loadBannerAd = () => {
      console.log('Loading banner ad...');
      
      // Set global options for banner ad
      (window as any).atOptions = {
        'key': 'c1e53781576d5b60a3b876b73a99b3b3',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };

      const bannerScript = document.createElement('script');
      bannerScript.type = 'text/javascript';
      bannerScript.src = '//monkeyhundredsarmed.com/c1e53781576d5b60a3b876b73a99b3b3/invoke.js';
      bannerScript.async = true;
      
      bannerScript.onload = () => {
        console.log('Banner ad script loaded successfully');
      };
      
      bannerScript.onerror = (error) => {
        console.error('Failed to load banner ad script:', error);
        const container = document.getElementById('banner-ad-container');
        if (container) {
          container.innerHTML = '<div style="width: 728px; height: 90px; background: #1f2937; border: 1px solid #374151; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px; border-radius: 8px;">Banner Advertisement</div>';
        }
      };

      // Append to container instead of head
      const container = document.getElementById('banner-ad-container');
      if (container) {
        container.appendChild(bannerScript);
      }
    };

    // Load second ad (direct script)
    const loadSecondAd = () => {
      setTimeout(() => {
        console.log('Loading second ad...');
        
        const secondScript = document.createElement('script');
        secondScript.type = 'text/javascript';
        secondScript.src = 'https://monkeyhundredsarmed.com/hphkx2a736?key=e47f05e9f941285596e13ec2b499358d';
        secondScript.async = true;
        
        secondScript.onload = () => {
          console.log('Second ad script loaded successfully');
        };
        
        secondScript.onerror = (error) => {
          console.error('Failed to load second ad script:', error);
          const container = document.getElementById('ad-container-2');
          if (container) {
            container.innerHTML = '<div style="width: 100%; height: 90px; background: #1f2937; border: 1px solid #374151; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px; border-radius: 8px;">Advertisement Space</div>';
          }
        };

        // Append to container instead of head
        const container = document.getElementById('ad-container-2');
        if (container) {
          container.appendChild(secondScript);
        }
      }, 1000);
    };

    // Initialize both ads
    loadBannerAd();
    loadSecondAd();

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[src*="monkeyhundredsarmed.com"]') as NodeListOf<HTMLScriptElement>;
      scripts.forEach(script => script.remove());
      delete (window as any).atOptions;
    };
  }, []);

  // Fetch sports on mount and sort them with football first
  useEffect(() => {
    const loadSports = async () => {
      setLoadingSports(true);
      try {
        let sportsData = await fetchSports();
        
        // Sort sports to put football first, then basketball
        sportsData = sportsData.sort((a, b) => {
          if (a.name.toLowerCase() === 'football') return -1;
          if (b.name.toLowerCase() === 'football') return 1;
          if (a.name.toLowerCase() === 'basketball') return -1;
          if (b.name.toLowerCase() === 'basketball') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setSports(sportsData);
        
        // Auto-select first sport (should be football after sorting)
        if (sportsData.length > 0) {
          handleSelectSport(sportsData[0].id);
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

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredMatches(matches);
      return;
    }
    
    const lowercaseSearch = value.toLowerCase();
    const results = matches.filter(match => {
      return match.title.toLowerCase().includes(lowercaseSearch) || 
        match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
    });
    
    setFilteredMatches(results);
  };

  // Fetch matches when a sport is selected
  const handleSelectSport = async (sportId: string) => {
    setSelectedSport(sportId);
    setLoadingMatches(true);
    
    try {
      // Check if we already have matches for this sport
      if (allMatches[sportId]) {
        setMatches(allMatches[sportId]);
        setFilteredMatches(allMatches[sportId]);
        
        // Find popular matches from major leagues
        const popular = allMatches[sportId].filter(match => 
          isPopularLeague(match.title) && 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        setPopularMatches(popular);
      } else {
        const matchesData = await fetchMatches(sportId);
        setMatches(matchesData);
        setFilteredMatches(matchesData);
        
        // Find popular matches from major leagues
        const popular = matchesData.filter(match => 
          isPopularLeague(match.title) && 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        setPopularMatches(popular);
        
        // Store the matches for this sport
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
        <title>DamiTV - Watch Live Football & Sports Streams | Free Football Streaming</title>
        <meta name="description" content="Watch free live football streams, soccer matches, and sports TV online on DamiTV. Access hundreds of free sports streaming channels with no registration required." />
        <meta name="keywords" content="live football streaming, watch football online, free sports streams, live matches today, free football tv" />
        <link rel="canonical" href="https://damitv.pro/" />
        {/* Schema.org structured data for sports events */}
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": "Live Sports Streaming",
            "description": "Watch live football and sports streams online for free",
            "url": "https://damitv.pro/",
            "location": {
              "@type": "VirtualLocation",
              "name": "DamiTV Streaming Platform"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          }
        `}
        </script>
      </Helmet>
      
      <main className="py-4">
        {/* Banner Ad Section - Top of page */}
        <div className="w-full bg-gray-900/50 border-b border-gray-700/50 py-2 md:py-3 mb-6">
          <div className="flex justify-center px-2 md:px-4">
            <div className="bg-gray-800/60 rounded-lg p-2 md:p-3 border border-orange-500/30 shadow-lg w-full max-w-[320px] md:max-w-[760px] min-h-[90px] md:min-h-[100px] flex items-center justify-center">
              <div 
                id="banner-ad-container" 
                className="text-center w-full min-h-[70px] md:min-h-[90px] flex items-center justify-center"
                style={{ minWidth: '300px', minHeight: '90px' }}
              >
                <div className="text-gray-400 text-xs md:text-sm">Loading Banner Advertisement...</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Featured Sports</h1>
            <Link to="/schedule">
              <Button variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent">
                <Calendar className="mr-2 h-4 w-4" /> View Schedule
              </Button>
            </Link>
          </div>
          <SportsList 
            sports={sports}
            onSelectSport={handleSelectSport}
            selectedSport={selectedSport}
            isLoading={loadingSports}
          />
        </div>
        
        {/* Featured Channels Section */}
        <FeaturedChannels />
        
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
              matches={searchTerm ? filteredMatches : matches}
              sportId={selectedSport || ""}
              isLoading={loadingMatches}
            />
          )}
        </div>

        {/* Second Ad Section - Middle of content */}
        <div className="flex justify-center px-2 md:px-4 py-2 md:py-4 mb-8">
          <div className="bg-gray-900/30 rounded-lg p-2 md:p-4 border border-gray-600/30 min-h-[90px] md:min-h-[110px] w-full max-w-[320px] md:max-w-[760px] flex items-center justify-center">
            <div 
              id="ad-container-2" 
              className="text-center w-full min-h-[70px] md:min-h-[90px] flex items-center justify-center"
              style={{ minWidth: '300px', minHeight: '90px' }}
            >
              <div className="text-gray-400 text-xs md:text-sm">Loading Advertisement...</div>
            </div>
          </div>
        </div>
        
        {/* Sports News Section */}
        <div className="mb-8">
          <NewsSection />
        </div>
        
        {/* Side-by-side promotion boxes with non-intrusive sidebar ad */}
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
        
        {/* Non-intrusive sidebar ad */}
        <div className="mt-6">
          <Advertisement type="sidebar" className="w-full" />
        </div>
      </main>
    </PageLayout>
  );
};

export default Index;
