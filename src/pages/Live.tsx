
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
              
              <LiveMatchesGrid
                title="Live Matches"
                matches={liveMatches}
                isLoading={loading}
                onSelectMatch={(match) => {
                  if (match.sources && match.sources.length > 0) {
                    loadStream(match.sources[0]);
                    return;
                  }
                }}
                isLive={true}
              />
              
              <Separator className="my-8 bg-[#343a4d]" />
              
              <LiveMatchesGrid
                title="Upcoming Matches"
                matches={upcomingMatches}
                isLoading={loading}
                onSelectMatch={() => {}}
              />
              
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
