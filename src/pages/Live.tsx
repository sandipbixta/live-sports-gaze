
import React from 'react';
import { Separator } from '../components/ui/separator';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';
import LiveFeaturedMatch from '../components/live/LiveFeaturedMatch';
import LiveMatchesGrid from '../components/live/LiveMatchesGrid';
import LiveChannelsPromo from '../components/live/LiveChannelsPromo';
import LiveMatchesContainer from '../components/live/LiveMatchesContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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
              <Card className="bg-[#1A1F2C] border-[#343a4d] mb-10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    Live Matches
                    <div className="h-1 w-20 bg-[#fa2d04] ml-3 rounded-full"></div>
                    <div className="flex items-center ml-3 bg-[#fa2d04]/10 px-2 py-1 rounded-md">
                      <span className="w-2 h-2 bg-[#fa2d04] rounded-full mr-2 animate-pulse"></span>
                      <span className="text-sm text-[#fa2d04] font-medium">LIVE NOW</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <LiveMatchesGrid 
                    matches={liveMatches}
                    isLoading={loading}
                    onSelectMatch={handleSelectMatch}
                    isLive={true}
                  />
                </CardContent>
              </Card>
              
              {/* UPCOMING MATCHES SECTION */}
              <Card className="bg-[#1A1F2C] border-[#343a4d] mb-10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    Upcoming Matches
                    <div className="h-1 w-20 bg-gray-400 ml-3 rounded-full"></div>
                    <div className="flex items-center ml-3 bg-gray-400/10 px-2 py-1 rounded-md">
                      <span className="text-sm text-gray-400 font-medium">COMING SOON</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <LiveMatchesGrid 
                    matches={upcomingMatches}
                    isLoading={loading}
                    isLive={false}
                  />
                </CardContent>
              </Card>
              
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
