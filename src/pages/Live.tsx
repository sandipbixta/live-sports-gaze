
import React from 'react';
import { Separator } from '../components/ui/separator';
import AppHeader from '../components/layout/AppHeader';
import AppFooter from '../components/layout/AppFooter';
import LiveFeaturedMatch from '../components/live/LiveFeaturedMatch';
import LiveMatchesGrid from '../components/live/LiveMatchesGrid';
import LiveChannelsPromo from '../components/live/LiveChannelsPromo';
import LiveMatchesContainer from '../components/live/LiveMatchesContainer';

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
            loadStream
          }) => (
            <>
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
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Live Matches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
                    ))
                  ) : liveMatches.length === 0 ? (
                    <div className="col-span-4 w-full bg-[#242836] rounded-xl p-6 text-center">
                      <p className="text-gray-300">No live matches currently available.</p>
                    </div>
                  ) : (
                    liveMatches.map((match) => (
                      <div 
                        key={match.id} 
                        className="bg-[#242836] border-[#343a4d] border rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
                        onClick={() => {
                          if (match.sources && match.sources.length > 0) {
                            loadStream(match.sources[0]);
                            return;
                          }
                        }}
                      >
                        <div className="p-4">
                          <h3 className="font-bold mb-2 text-white">{match.title}</h3>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-[#fa2d04] rounded-full mr-2"></span>
                            <p className="text-sm text-gray-300">Live Now</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <Separator className="my-8 bg-[#343a4d]" />
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Upcoming Matches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
                    ))
                  ) : upcomingMatches.length === 0 ? (
                    <div className="col-span-4 w-full bg-[#242836] rounded-xl p-6 text-center">
                      <p className="text-gray-300">No upcoming matches currently available.</p>
                    </div>
                  ) : (
                    upcomingMatches.map((match) => (
                      <div 
                        key={match.id} 
                        className="bg-[#242836] border-[#343a4d] border rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
                        onClick={() => {}}
                      >
                        <div className="p-4">
                          <h3 className="font-bold mb-2 text-white">{match.title}</h3>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                            <p className="text-sm text-gray-300">Coming soon</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
