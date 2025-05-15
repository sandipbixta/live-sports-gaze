
import React from 'react';
import { Separator } from '../components/ui/separator';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';
import LiveFeaturedMatch from '../components/live/LiveFeaturedMatch';
import LiveChannelsPromo from '../components/live/LiveChannelsPromo';
import LiveMatchesContainer from '../components/live/LiveMatchesContainer';
import LiveMatches from '../components/live/LiveMatches';
import UpcomingMatches from '../components/live/UpcomingMatches';
import PopularMatches from '../components/PopularMatches';

const Live = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <AppHeader />
      
      <main className="container mx-auto py-6 px-4">
        <LiveMatchesContainer>
          {({ 
            liveMatches, 
            upcomingMatches, 
            loading, 
            featuredMatch, 
            currentStream, 
            streamLoading,
            loadStream,
            handleSelectMatch
          }) => (
            <>
              {/* Featured Match Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-6">Live Now</h1>
                <LiveFeaturedMatch
                  match={featuredMatch}
                  stream={currentStream}
                  isLoading={loading}
                  streamLoading={streamLoading}
                />
              </div>
              
              <Separator className="my-8 bg-[#343a4d]" />
              
              {/* LIVE MATCHES SECTION */}
              <div className="mb-10">
                <LiveMatches 
                  liveMatches={liveMatches}
                  selectedSport="1" // Default to football
                  onSelectMatch={handleSelectMatch}
                />
              </div>
              
              {/* Popular Matches Section - If we have popular matches data */}
              {liveMatches.length > 0 && (
                <>
                  <Separator className="my-8 bg-[#343a4d]" />
                  <div className="mb-10">
                    <PopularMatches 
                      popularMatches={liveMatches.filter(match => 
                        match.sources && match.sources.length > 0 && 
                        match.title.toLowerCase().includes('premier league')
                      )}
                      selectedSport="1" // Default to football
                    />
                  </div>
                </>
              )}
              
              {/* UPCOMING MATCHES SECTION */}
              <Separator className="my-8 bg-[#343a4d]" />
              <div className="mb-10">
                <UpcomingMatches 
                  upcomingMatches={upcomingMatches}
                  selectedSport="1" // Default to football
                />
              </div>
              
              <LiveChannelsPromo />
            </>
          )}
        </LiveMatchesContainer>
      </main>
      
      <AppFooter />
    </div>
  );
};

export default Live;
