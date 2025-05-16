
import React from 'react';
import PageLayout from '../components/PageLayout';
import ChannelsGrid from '../components/ChannelsGrid';
import Advertisement from '../components/Advertisement';
import { useIsMobile } from '../hooks/use-mobile';

const Channels = () => {
  const isMobile = useIsMobile();
  
  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Live TV Channels</h1>
        <p className="text-gray-300 mb-6">
          Watch international sports channels from around the world. Select a country and channel to start streaming.
        </p>
        
        {/* Single ad placement before channel grid - responsive */}
        <div className={`mb-6 ${isMobile ? 'overflow-x-hidden' : ''}`}>
          <Advertisement type="banner" className="w-full" />
        </div>
        
        <ChannelsGrid />
      </div>
    </PageLayout>
  );
};

export default Channels;
