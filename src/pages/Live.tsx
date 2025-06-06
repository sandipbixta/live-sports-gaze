import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match, Stream, Source, Sport } from '../types/sports';
import { fetchMatches, fetchStream, fetchSports } from '../api/sportsApi';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import StreamPlayer from '../components/StreamPlayer';
import StreamSources from '../components/match/StreamSources';
import { Link } from 'react-router-dom';
import { Radio, Tv, RefreshCcw, Calendar, Search, Clock, CircleDot, Dribbble } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import MatchCard from '../components/MatchCard';
import SearchBar from '../components/SearchBar';
import { useIsMobile } from '../hooks/use-mobile';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../components/ui/badge';

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
  
  // Check if a match is currently live - More strict criteria
  const isMatchLive = (match: Match): boolean => {
    // A match is considered live only if it has sources AND the match time is within 1 hour of now
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      Math.abs(matchTime - now) < oneHourInMs
    );
  };

  // Helper function to group matches by sport
  const groupMatchesBySport = (matches: Match[]) => {
    const groupedMatches: Record<string, Match[]> = {};
    
    matches.forEach(match => {
      const sportId = match.sportId || "unknown";
      if (!groupedMatches[sportId]) {
        groupedMatches[sportId] = [];
      }
      groupedMatches[sportId].push(match);
    });
    
    return groupedMatches;
  };
  
  // Get sport name by ID
  const getSportName = (sportId: string): string => {
    const sport = sports.find(s => s.id === sportId);
    if (sport) return sport.name;
    
    // Default mappings for common sport IDs
    const sportMappings: Record<string, string> = {
      '1': 'Football',
      '2': 'Basketball',
      '3': 'Ice Hockey',
      '4': 'Tennis',
      'football': 'Football',
      'basketball': 'Basketball',
      'hockey': 'Ice Hockey'
    };
    
    return sportMappings[sportId] || 'Other Sports';
  };
  
  // Get sport icon by ID
  const getSportIcon = (sportId: string) => {
    switch(sportId) {
      case '1':
      case 'football':
        return <CircleDot size={16} />;
      case '2':
      case 'basketball':
        return <Dribbble size={16} />;
      default:
        return null;
    }
  };
  
  // Memoized stream fetching function
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    const sourceKey = streamNo 
      ? `${source.source}/${source.id}/${streamNo}` 
      : `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`Fetching stream data: source=${source.source}, id=${source.id}, streamNo=${streamNo}`);
      const streamData = await fetchStream(source.source, source.id, streamNo);
      console.log('Stream data received:', streamData);
      
      // Handle both single stream and array of streams
      if (Array.isArray(streamData)) {
        // If array, pick the requested streamNo or the first HD stream
        const selectedStream = streamNo 
          ? streamData.find(s => s.streamNo === streamNo)
          : streamData.find(s => s.hd) || streamData[0];
        
        setCurrentStream(selectedStream || null);
      } else {
        setCurrentStream(streamData);
      }
      
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
        
        // Fetch from multiple sports to find live matches including wrestling/combat sports
        const sportIds = ['1', '2', '3', '4', 'football', 'basketball', 'hockey', 'tennis', 'baseball', 'cricket', 'rugby', 'golf', 'fight', 'wrestling', 'ufc', 'boxing']; // Extended sport IDs with combat sports
        let allFetchedMatches: Match[] = [];
        
        for (const sportId of sportIds) {
          console.log(`Fetching matches for sport ID: ${sportId}`);
          try {
            const matches = await fetchMatches(sportId);
            console.log(`Matches for ${sportId}:`, matches ? matches.length : 0);
            
            // Add sport ID as a property to each match for reference
            const matchesWithSportId = matches.map(match => ({
              ...match,
              sportId
            }));
            allFetchedMatches = [...allFetchedMatches, ...matchesWithSportId];
          } catch (error) {
            console.error(`Error fetching matches for sport ${sportId}:`, error);
          }
        }
        
        console.log('All matches before filtering:', allFetchedMatches.length);
        
        // Filter out advertisement matches (like Sky Sports News) but include wrestling/combat sports
        allFetchedMatches = allFetchedMatches.filter(match => 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        
        console.log('Matches after filtering ads:', allFetchedMatches.length);
        
        // Separate matches into live and upcoming using strict criteria
        const live = allFetchedMatches.filter(match => {
          const matchTime = new Date(match.date).getTime();
          const now = new Date().getTime();
          const oneHourInMs = 60 * 60 * 1000;
          
          return match.sources && 
                 match.sources.length > 0 && 
                 matchTime - now < oneHourInMs && // Match hasn't started more than an hour in the future
                 now - matchTime < oneHourInMs;   // Match hasn't ended more than an hour ago
        });
        
        const upcoming = allFetchedMatches.filter(match => 
          !live.some(liveMatch => liveMatch.id === match.id)
        );
        
        console.log('Live matches:', live.length);
        console.log('Upcoming matches:', upcoming.length);
        
        setAllMatches(allFetchedMatches);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setFilteredMatches(allFetchedMatches);
        
        // Set featured match (first live one with sources if available, otherwise first match)
        const liveWithSources = live.filter(match => match.sources && match.sources.length > 0);
        const firstLiveMatch = liveWithSources.length > 0 ? liveWithSources[0] : null;
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

  // Function to handle source change for the current match
  const handleSourceChange = (source: string, id: string, streamNo?: number) => {
    if (featuredMatch) {
      fetchStreamData({ source, id }, streamNo);
    }
  };

  // Handle stream retry
  const handleStreamRetry = () => {
    if (featuredMatch?.sources && featuredMatch.sources.length > 0) {
      fetchStreamData(featuredMatch.sources[0]);
    }
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

  // Format match time
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get unique sport IDs from matches
  const getUniqueSportIds = (): string[] => {
    const sportIds = new Set<string>();
    allMatches.forEach(match => {
      if (match.sportId) sportIds.add(match.sportId);
    });
    return Array.from(sportIds);
  };

  // Render matches by sport
  const renderMatchesBySport = (matches: Match[]) => {
    if (matches.length === 0) return null;
    
    // Group matches by sport
    const groupedMatches = groupMatchesBySport(matches);
    const sportIds = Object.keys(groupedMatches);
    
    return sportIds.map(sportId => (
      <div key={`sport-${sportId}`} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {getSportIcon(sportId)}
          <h3 className="text-xl font-bold text-white">{getSportName(sportId)}</h3>
          <Badge variant="outline" className="ml-2 bg-[#242836] text-white text-xs">
            {groupedMatches[sportId].length} {groupedMatches[sportId].length === 1 ? 'match' : 'matches'}
          </Badge>
        </div>
        
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
          {groupedMatches[sportId].map((match) => (
            <div 
              key={`${sportId}-${match.id}`} 
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
      </div>
    ));
  };

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
                <Tv size={16} className="text-[#ff5a36] animate-pulse" />
                <span className="text-sm font-medium text-white" aria-live="polite">
                  {liveMatches.length} Live Now
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#242836] border-[#343a4d] hover:bg-[#2a2f3f]"
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5] mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading live streams...</p>
            </div>
          ) : featuredMatch ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{featuredMatch.title}</h2>
                {streamLoading ? (
                  <div className="text-sm text-[#9b87f5] flex items-center gap-1">
                    <span className="inline-block h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse"></span>
                    Loading stream...
                  </div>
                ) : isMatchLive(featuredMatch) ? (
                  <div className="text-sm text-[#fa2d04] flex items-center gap-1">
                    <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
                    Live now
                  </div>
                ) : (
                  <div className="text-sm text-[#1EAEDB] flex items-center gap-1">
                    <Clock size={14} />
                    Starts at {formatMatchTime(featuredMatch.date)}
                  </div>
                )}
              </div>
              <StreamPlayer 
                stream={currentStream} 
                isLoading={streamLoading}
                onRetry={handleStreamRetry} 
              />
              
              {/* Stream Sources with substreams */}
              {featuredMatch.sources && featuredMatch.sources.length > 0 && (
                <StreamSources
                  sources={featuredMatch.sources}
                  activeSource={activeSource}
                  onSourceChange={handleSourceChange}
                  streamId={featuredMatch.id}
                />
              )}
            </div>
          ) : (
            <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
              <Tv size={48} className="text-[#343a4d] mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-2">No live streams available at the moment.</p>
              <p className="text-gray-400 text-sm mb-4">Check back later or view scheduled matches.</p>
              <div className="flex gap-4 justify-center mt-2">
                <Button onClick={handleRetryLoading} className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                  <RefreshCcw size={16} className="mr-2" />
                  Refresh
                </Button>
                <Link to="/schedule">
                  <Button variant="outline" className="bg-transparent border border-[#343a4d]">
                    <Calendar size={16} className="mr-2" />
                    View Schedule
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-8 bg-[#343a4d]" />
      
      {/* Sport Filter Pills */}
      {!loading && allMatches.length > 0 && (
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`${
                activeSportFilter === 'all' 
                  ? 'bg-[#343a4d] border-[#ff5a36]' 
                  : 'bg-[#242836] border-[#343a4d]'
              } whitespace-nowrap`}
              onClick={() => setActiveSportFilter('all')}
            >
              All Sports
            </Button>
            {getUniqueSportIds().map(sportId => (
              <Button
                key={`filter-${sportId}`}
                variant="outline"
                size="sm"
                className={`${
                  activeSportFilter === sportId 
                    ? 'bg-[#343a4d] border-[#ff5a36]' 
                    : 'bg-[#242836] border-[#343a4d]'
                } whitespace-nowrap flex items-center gap-1`}
                onClick={() => setActiveSportFilter(sportId)}
              >
                {getSportIcon(sportId)}
                {getSportName(sportId)}
              </Button>
            ))}
          </div>
        </div>
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
              className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white"
            >
              All Matches
            </TabsTrigger>
            <TabsTrigger 
              value="live" 
              className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white"
            >
              <span className="inline-block h-2 w-2 bg-[#ff5a36] rounded-full animate-pulse mr-1"></span>
              Live Now ({liveMatches.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white"
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
                renderMatchesBySport(liveMatches.filter(match => filteredMatches.some(fm => fm.id === match.id))) :
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
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
                renderMatchesBySport(upcomingMatches.filter(match => filteredMatches.some(fm => fm.id === match.id)).slice(0, 24)) :
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
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
            <div className="w-full bg-[#242836] rounded-xl p-8 text-center">
              {searchQuery ? (
                <div>
                  <Search size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-300 mb-3">No matches found for "{searchQuery}"</p>
                  <Button onClick={() => setSearchQuery('')} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-3">No matches currently available.</p>
                  <Button onClick={handleRetryLoading} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                    <RefreshCcw size={14} className="mr-1" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="live" className="mt-0">
          {filteredMatches.length > 0 ? (
            activeSportFilter === "all" ? 
              renderMatchesBySport(filteredMatches) :
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
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
            <div className="w-full bg-[#242836] rounded-xl p-8 text-center">
              {searchQuery ? (
                <div>
                  <Search size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-300 mb-3">No live matches found for "{searchQuery}"</p>
                  <Button onClick={() => setSearchQuery('')} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div>
                  <Tv size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-300 mb-3">No live matches currently available.</p>
                  <Button onClick={handleRetryLoading} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                    <RefreshCcw size={14} className="mr-1" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-0">
          {filteredMatches.length > 0 ? (
            activeSportFilter === "all" ? 
              renderMatchesBySport(filteredMatches) :
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
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
            <div className="w-full bg-[#242836] rounded-xl p-8 text-center">
              {searchQuery ? (
                <div>
                  <Search size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-300 mb-3">No upcoming matches found for "{searchQuery}"</p>
                  <Button onClick={() => setSearchQuery('')} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div>
                  <Calendar size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-300 mb-3">No upcoming matches scheduled.</p>
                  <Button onClick={handleRetryLoading} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                    <RefreshCcw size={14} className="mr-1" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      
      
      <Link to="/channels" className="block w-full">
        <div className="bg-[#242836] hover:bg-[#2a2f3f] border border-[#343a4d] rounded-xl p-6 text-center transition-all">
          <Radio className="h-10 w-10 text-[#9b87f5] mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-white">Live TV Channels</h3>
          <p className="text-gray-300 mt-2">Access 70+ international sports channels from around the world</p>
          <Button className="mt-4 bg-[#9b87f5] hover:bg-[#8a75e8]">Browse Channels</Button>
        </div>
      </Link>
    </PageLayout>
  );
};

export default Live;
