
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match } from '../types/sports';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Link } from 'react-router-dom';
import { Radio, Clock } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Helmet } from 'react-helmet-async';

import { useLiveMatches } from '../hooks/useLiveMatches';
import { useStreamPlayer } from '../hooks/useStreamPlayer';
import LiveHeader from '../components/live/LiveHeader';
import FeaturedPlayer from '../components/live/FeaturedPlayer';
import SportFilterPills from '../components/live/SportFilterPills';
import MatchesTabContent from '../components/live/MatchesTabContent';
import MatchSection from '../components/MatchSection';

const Live = () => {
  const { toast } = useToast();
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeSportFilter, setActiveSportFilter] = useState<string>("all");
  
  // Custom hooks for data management
  const { 
    allMatches, 
    liveMatches, 
    upcomingMatches, 
    sports, 
    loading, 
    handleRetryLoading 
  } = useLiveMatches();
  
  const {
    featuredMatch,
    currentStream,
    streamLoading,
    activeSource,
    handleMatchSelect,
    handleSourceChange,
    handleStreamRetry,
    setFeaturedMatch,
    fetchStreamData
  } = useStreamPlayer();

  // Set featured match when data loads
  useEffect(() => {
    if (!loading && !featuredMatch && allMatches.length > 0) {
      const liveWithSources = liveMatches.filter(match => match.sources && match.sources.length > 0);
      const firstLiveMatch = liveWithSources.length > 0 ? liveWithSources[0] : null;
      const firstMatch = allMatches.length > 0 ? allMatches[0] : null;
      const matchToFeature = firstLiveMatch || firstMatch;
      
      if (matchToFeature) {
        setFeaturedMatch(matchToFeature);
        
        // Fetch the stream for the featured match if it has sources
        if (matchToFeature.sources && matchToFeature.sources.length > 0) {
          fetchStreamData(matchToFeature.sources[0]);
        }
      }
    }
  }, [loading, featuredMatch, allMatches, liveMatches, setFeaturedMatch, fetchStreamData]);

  // Update filtered matches when search query or filters change
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

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      toast({
        title: "Searching",
        description: `Finding matches for "${searchQuery}"`,
      });
    }
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Live Sports Streaming | Watch Live Football Matches Online Free | DamiTV</title>
        <meta name="description" content="Watch live football matches, soccer games, and sports events streaming online for free. No registration required to stream live sports on DamiTV." />
        <meta name="keywords" content="live football streaming, live soccer matches, watch sports online, free live sports, stream football live" />
        <link rel="canonical" href="https://damitv.pro/live" />
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
        <LiveHeader
          liveMatchesCount={liveMatches.length}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
          onRefresh={handleRetryLoading}
        />
        
        <div id="stream-player">
          <FeaturedPlayer
            loading={loading}
            featuredMatch={featuredMatch}
            currentStream={currentStream}
            streamLoading={streamLoading}
            activeSource={activeSource}
            onSourceChange={handleSourceChange}
            onStreamRetry={handleStreamRetry}
            onRetryLoading={handleRetryLoading}
          />
        </div>
      </div>
      
      <Separator className="my-8 bg-[#343a4d]" />
      
      <SportFilterPills
        allMatches={allMatches}
        sports={sports}
        activeSportFilter={activeSportFilter}
        onSportFilterChange={setActiveSportFilter}
      />
      
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
            <MatchSection
              matches={liveMatches.filter(match => filteredMatches.some(fm => fm.id === match.id))}
              sportId="all"
              title="Live Matches"
              isLive={true}
            />
          )}
          
          {/* Upcoming Matches Section */}
          {upcomingMatches.length > 0 && (
            <MatchSection
              matches={upcomingMatches.filter(match => filteredMatches.some(fm => fm.id === match.id)).slice(0, 24)}
              sportId="all"
              title="Upcoming Matches"
              isLive={false}
            />
          )}
          
          {/* No matches message */}
          {filteredMatches.length === 0 && (
            <MatchesTabContent
              tabValue="all"
              filteredMatches={filteredMatches}
              sports={sports}
              activeSportFilter={activeSportFilter}
              searchQuery={searchQuery}
              onMatchSelect={handleMatchSelect}
              onSearchClear={() => setSearchQuery('')}
              onRetryLoading={handleRetryLoading}
            />
          )}
        </TabsContent>
        
        <MatchesTabContent
          tabValue="live"
          filteredMatches={filteredMatches}
          sports={sports}
          activeSportFilter={activeSportFilter}
          searchQuery={searchQuery}
          onMatchSelect={handleMatchSelect}
          onSearchClear={() => setSearchQuery('')}
          onRetryLoading={handleRetryLoading}
        />
        
        <MatchesTabContent
          tabValue="upcoming"
          filteredMatches={filteredMatches}
          sports={sports}
          activeSportFilter={activeSportFilter}
          searchQuery={searchQuery}
          onMatchSelect={handleMatchSelect}
          onSearchClear={() => setSearchQuery('')}
          onRetryLoading={handleRetryLoading}
        />
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
