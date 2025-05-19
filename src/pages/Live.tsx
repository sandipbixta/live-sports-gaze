
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match, Stream, Sport } from '../types/sports';
import { fetchMatches, fetchStream, fetchSports } from '../api/sportsApi';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Link } from 'react-router-dom';
import { Radio, Tv, RefreshCcw, Clock } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import SearchBar from '../components/SearchBar';
import { useIsMobile } from '../hooks/use-mobile';
import Advertisement from '../components/Advertisement';
import { Helmet } from 'react-helmet-async';
import { isMatchLive } from '../utils/matchUtils';

// Import refactored components
import LiveStreamPlayer from '../components/live/LiveStreamPlayer';
import NoMatchesState from '../components/live/NoMatchesState';
import LiveMatchesList from '../components/live/LiveMatchesList';
import SportFilter from '../components/live/SportFilter';

const Live = () => {
  const { toast } = useToast();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeSportFilter, setActiveSportFilter] = useState<string>("all");
  
  // Determine if we're on mobile
  const isMobile = useIsMobile();
  
  // Memoized stream fetching function
  const fetchStreamData = useCallback(async (source: { source: string, id: string }) => {
    setStreamLoading(true);
    setActiveSource(`${source.source}/${source.id}`);
    try {
      console.log(`Fetching stream data: source=${source.source}, id=${source.id}`);
      const stream = await fetchStream(source.source, source.id);
      console.log('Stream data received:', stream);
      setCurrentStream(stream);
      // Scroll to player if not in view
      const playerElement = document.getElementById('stream-player');
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      console.error('Error loading stream:', error);
      toast({
        title: "Error",
        description: "Failed to load stream.",
        variant: "destructive",
      });
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    const fetchLiveContent = async () => {
      setLoading(true);
      try {
        console.log('Fetching live matches...');
        // Get sports data to show proper sport names
        const sportsData = await fetchSports();
        setSports(sportsData);
        console.log('Sports data:', sportsData);
        
        // Fetch from multiple sports to find live matches
        const sportIds = ['1', '2', '3', '4', 'football', 'basketball', 'hockey']; // Extended sport IDs
        let allFetchedMatches: Match[] = [];
        
        for (const sportId of sportIds) {
          console.log(`Fetching matches for sport ID: ${sportId}`);
          const matches = await fetchMatches(sportId);
          console.log(`Matches for ${sportId}:`, matches ? matches.length : 0);
          
          // Add sport ID as a property to each match for reference
          const matchesWithSportId = matches.map(match => ({
            ...match,
            sportId
          }));
          allFetchedMatches = [...allFetchedMatches, ...matchesWithSportId];
        }
        
        console.log('All matches before filtering:', allFetchedMatches.length);
        
        // Filter out advertisement matches (like Sky Sports News)
        allFetchedMatches = allFetchedMatches.filter(match => 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        
        console.log('Matches after filtering ads:', allFetchedMatches.length);
        
        // Separate matches into live and upcoming
        const live = allFetchedMatches.filter(isMatchLive);
        const upcoming = allFetchedMatches.filter(match => !isMatchLive(match));
        
        console.log('Live matches:', live.length);
        console.log('Upcoming matches:', upcoming.length);
        
        setAllMatches(allFetchedMatches);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setFilteredMatches(allFetchedMatches);
        
        // Set featured match (first live one with sources if available, otherwise first match)
        const firstLiveMatch = live.length > 0 ? live[0] : null;
        const firstMatch = allFetchedMatches.length > 0 ? allFetchedMatches[0] : null;
        const matchToFeature = firstLiveMatch || firstMatch;
        
        if (matchToFeature) {
          setFeaturedMatch(matchToFeature);
          
          // Fetch the stream for the featured match if it has sources
          if (matchToFeature.sources && matchToFeature.sources.length > 0) {
            await fetchStreamData(matchToFeature.sources[0]);
          } else {
            setCurrentStream(null);
          }
        } else {
          setFeaturedMatch(null);
          setCurrentStream(null);
        }
      } catch (error) {
        console.error('Error fetching live content:', error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveContent();
  }, [toast, retryCount, fetchStreamData]);

  // Update filtered matches when search query or active tab or sport filter changes
  useEffect(() => {
    let matchesToFilter = allMatches;
    
    // First filter by tab selection
    if (activeTab === "live") {
      matchesToFilter = liveMatches;
    } else if (activeTab === "upcoming") {
      matchesToFilter = upcomingMatches;
    }
    
    // Then filter by sport if not "all"
    if (activeSportFilter !== "all") {
      matchesToFilter = matchesToFilter.filter(match => match.sportId === activeSportFilter);
    }
    
    // Then filter by search query
    if (searchQuery.trim() === '') {
      setFilteredMatches(matchesToFilter);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = matchesToFilter.filter(match => 
        match.title.toLowerCase().includes(query) || 
        match.teams?.home?.name?.toLowerCase().includes(query) || 
        match.teams?.away?.name?.toLowerCase().includes(query)
      );
      setFilteredMatches(filtered);
    }
  }, [searchQuery, activeTab, activeSportFilter, allMatches, liveMatches, upcomingMatches]);

  // Function to handle match selection
  const handleMatchSelect = (match: Match) => {
    setFeaturedMatch(match);
    if (match.sources && match.sources.length > 0) {
      fetchStreamData(match.sources[0]);
    } else {
      setCurrentStream(null);
      toast({
        title: "No Stream",
        description: "This match has no available streams.",
        variant: "destructive",
      });
    }
  };

  // Function to retry loading content
  const handleRetryLoading = () => {
    setRetryCount(prev => prev + 1);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
    
    // Show a toast to confirm search
    if (searchQuery.trim() !== '') {
      toast({
        title: "Searching",
        description: `Finding matches for "${searchQuery}"`,
      });
    }
  };

  // Clear search query
  const handleSearchClear = () => setSearchQuery('');

  return (
    <PageLayout>
      <Helmet>
        <title>Live Sports Streaming | Watch Live Football Matches Online Free | DamiTV</title>
        <meta name="description" content="Watch live football matches, soccer games, and sports events streaming online for free. No registration required to stream live sports on DamiTV." />
        <meta name="keywords" content="live football streaming, live soccer matches, watch sports online, free live sports, stream football live" />
        <link rel="canonical" href="https://damitv.pro/live" />
        {/* Schema.org structured data for live sports events */}
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "BroadcastEvent",
            "name": "Live Sports Streaming",
            "description": "Watch live football matches and sports events online",
            "url": "https://damitv.pro/live",
            "isLiveBroadcast": true,
            "startDate": "${new Date().toISOString()}",
            "broadcastOfEvent": {
              "@type": "SportsEvent",
              "name": "Live Football Matches"
            },
            "videoFormat": "HD"
          }
        `}
        </script>
      </Helmet>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-white">Live &amp; Upcoming</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearchSubmit}
              placeholder="Search games..."
              className="w-full sm:w-64"
              showButton={true}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#242836] px-3 py-1.5 rounded-full">
                <Tv size={16} className="text-[#fa2d04] animate-pulse" />
                <span className="text-sm font-medium text-white" aria-live="polite">
                  {liveMatches.length} Live Now
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#242836] border-[#343a4d] hover:bg-[#2a2f3f] text-white"
                onClick={handleRetryLoading}
                aria-label="Refresh live matches"
              >
                <RefreshCcw size={14} className="mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        <div id="stream-player">
          {loading ? (
            <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fa2d04] mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading live streams...</p>
            </div>
          ) : featuredMatch ? (
            <LiveStreamPlayer 
              featuredMatch={featuredMatch}
              currentStream={currentStream}
              streamLoading={streamLoading}
              activeSource={activeSource}
              setActiveSource={setActiveSource}
              setCurrentStream={setCurrentStream}
            />
          ) : (
            <NoMatchesState 
              icon="tv"
              message="No live streams available at the moment."
              onRefresh={handleRetryLoading}
            />
          )}
        </div>
      </div>
      
      <Separator className="my-8 bg-[#343a4d]" />
      
      {/* Sport Filter Pills */}
      {!loading && allMatches.length > 0 && (
        <SportFilter 
          allMatches={allMatches}
          activeSportFilter={activeSportFilter}
          setActiveSportFilter={setActiveSportFilter}
        />
      )}
      
      {/* Tabs Navigation for All/Live/Upcoming */}
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-[#242836] border border-[#343a4d]">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white text-white"
            >
              All Matches
            </TabsTrigger>
            <TabsTrigger 
              value="live" 
              className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white text-white"
            >
              <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse mr-1"></span>
              Live Now ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white text-white"
            >
              <Clock size={14} className="mr-1" />
              Upcoming ({upcomingMatches.length})
            </TabsTrigger>
          </TabsList>
          
          {searchQuery && (
            <div className="text-sm text-gray-300" aria-live="polite">
              {filteredMatches.length === 0 ? 'No matches found' : `Found ${filteredMatches.length} matches`}
            </div>
          )}
        </div>
        
        <TabsContent value="all" className="mt-0">
          {/* Live Matches Section */}
          {liveMatches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="inline-block h-3 w-3 bg-[#fa2d04] rounded-full animate-pulse"></span>
                Live Matches
              </h2>
              {activeSportFilter === "all" ? 
                <LiveMatchesList 
                  matches={liveMatches.filter(match => filteredMatches.some(fm => fm.id === match.id))} 
                  sports={sports}
                  onMatchSelect={handleMatchSelect}
                /> :
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
                  {liveMatches
                    .filter(match => filteredMatches.some(fm => fm.id === match.id))
                    .map((match) => (
                      <div 
                        key={`live-${match.id}`} 
                        className="cursor-pointer"
                        onClick={() => handleMatchSelect(match)}
                      >
                        <MatchCard 
                          match={match}
                          sportId={match.sportId || "1"}
                          onClick={() => handleMatchSelect(match)}
                          preventNavigation={true}
                        />
                      </div>
                    ))
                  }
                </div>
              }
            </div>
          )}
          
          {/* Upcoming Matches Section */}
          {upcomingMatches.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                <Clock size={18} className="text-[#1EAEDB]" />
                Upcoming Matches
              </h2>
              {activeSportFilter === "all" ? 
                <LiveMatchesList 
                  matches={upcomingMatches
                    .filter(match => filteredMatches.some(fm => fm.id === match.id))
                    .slice(0, 24)} 
                  sports={sports}
                  onMatchSelect={handleMatchSelect}
                /> :
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 upcoming-matches-grid`}>
                  {upcomingMatches
                    .filter(match => filteredMatches.some(fm => fm.id === match.id))
                    .slice(0, 12) // Limit to avoid too many cards
                    .map((match) => (
                      <div 
                        key={`upcoming-${match.id}`} 
                        className="cursor-pointer"
                        onClick={() => handleMatchSelect(match)}
                      >
                        <MatchCard 
                          match={match}
                          sportId={match.sportId || "1"}
                          onClick={() => handleMatchSelect(match)}
                          preventNavigation={true}
                        />
                      </div>
                    ))
                  }
                </div>
              }
            </div>
          )}
          
          {/* No matches message */}
          {filteredMatches.length === 0 && (
            <NoMatchesState 
              searchQuery={searchQuery}
              onSearchClear={handleSearchClear}
              onRefresh={handleRetryLoading}
            />
          )}
        </TabsContent>
        
        <TabsContent value="live" className="mt-0">
          {filteredMatches.length > 0 ? (
            activeSportFilter === "all" ? 
              <LiveMatchesList 
                matches={filteredMatches} 
                sports={sports}
                onMatchSelect={handleMatchSelect}
              /> :
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
                {filteredMatches.map((match) => (
                  <div 
                    key={`live-tab-${match.id}`} 
                    className="cursor-pointer"
                    onClick={() => handleMatchSelect(match)}
                  >
                    <MatchCard 
                      match={match}
                      sportId={match.sportId || "1"}
                      onClick={() => handleMatchSelect(match)}
                      preventNavigation={true}
                    />
                  </div>
                ))}
              </div>
          ) : (
            <NoMatchesState 
              searchQuery={searchQuery}
              onSearchClear={handleSearchClear}
              onRefresh={handleRetryLoading}
              icon="tv"
              message="No live matches currently available."
            />
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-0">
          {filteredMatches.length > 0 ? (
            activeSportFilter === "all" ? 
              <LiveMatchesList 
                matches={filteredMatches} 
                sports={sports}
                onMatchSelect={handleMatchSelect}
              /> :
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 upcoming-matches-grid`}>
                {filteredMatches.map((match) => (
                  <div 
                    key={`upcoming-tab-${match.id}`} 
                    className="cursor-pointer"
                    onClick={() => handleMatchSelect(match)}
                  >
                    <MatchCard 
                      match={match}
                      sportId={match.sportId || "1"}
                      onClick={() => handleMatchSelect(match)}
                      preventNavigation={true}
                    />
                  </div>
                ))}
              </div>
          ) : (
            <NoMatchesState 
              searchQuery={searchQuery}
              onSearchClear={handleSearchClear}
              onRefresh={handleRetryLoading}
              icon="calendar"
              message="No upcoming matches scheduled."
            />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Single ad placement - modified to be non-intrusive */}
      {!loading && filteredMatches.length > 0 && (
        <div className="mb-6">
          <Advertisement type="banner" className="w-full" />
        </div>
      )}
      
      <Link to="/channels" className="block w-full">
        <div className="bg-[#242836] hover:bg-[#2a2f3f] border border-[#343a4d] rounded-xl p-6 text-center transition-all">
          <Radio className="h-10 w-10 text-[#fa2d04] mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-white">Live TV Channels</h3>
          <p className="text-gray-300 mt-2">Access 70+ international sports channels from around the world</p>
          <Button className="mt-4 bg-[#fa2d04] hover:bg-[#e02703]">Browse Channels</Button>
        </div>
      </Link>
    </PageLayout>
  );
};

export default Live;
