
import React from 'react';
import { Separator } from '../components/ui/separator';
import PageLayout from '../components/PageLayout';
import Advertisement from '../components/Advertisement';
import { useLiveStreams } from '../hooks/useLiveStreams';
import { useMatchFilter } from '../hooks/useMatchFilter';

// Import refactored components
import LiveStreamPlayer from '../components/live/LiveStreamPlayer';
import NoMatchesState from '../components/live/NoMatchesState';
import SportFilter from '../components/live/SportFilter';
import LiveHeader from '../components/live/LiveHeader';
import TabsFilter from '../components/live/TabsFilter';
import ChannelsPromo from '../components/live/ChannelsPromo';
import LiveSEO from '../components/live/LiveSEO';

const Live = () => {
  // Use custom hooks to handle data fetching and filtering
  const { 
    allMatches,
    liveMatches,
    upcomingMatches,
    sports,
    loading,
    featuredMatch,
    currentStream,
    streamLoading,
    activeSource,
    setActiveSource,
    handleMatchSelect,
    handleRetryLoading,
    setCurrentStream
  } = useLiveStreams();

  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    activeSportFilter,
    setActiveSportFilter,
    filteredMatches,
    handleSearchSubmit,
    handleSearchClear
  } = useMatchFilter({ 
    allMatches, 
    liveMatches, 
    upcomingMatches 
  });

  return (
    <PageLayout>
      <LiveSEO />
      
      <div className="mb-8">
        <LiveHeader
          liveMatchesCount={liveMatches.length}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
          onRefresh={handleRetryLoading}
        />
        
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
      <TabsFilter 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredMatches={filteredMatches}
        liveMatches={liveMatches}
        upcomingMatches={upcomingMatches}
        activeSportFilter={activeSportFilter}
        sports={sports}
        searchQuery={searchQuery}
        onMatchSelect={handleMatchSelect}
        onSearchClear={handleSearchClear}
        onRefresh={handleRetryLoading}
      />
      
      {/* Single ad placement - modified to be non-intrusive */}
      {!loading && filteredMatches.length > 0 && (
        <div className="mb-6">
          <Advertisement type="banner" className="w-full" />
        </div>
      )}
      
      <ChannelsPromo />
    </PageLayout>
  );
};

export default Live;
