
import React from 'react';
import PageLayout from '../components/PageLayout';
import ChannelsGrid from '../components/ChannelsGrid';
import Advertisement from '../components/Advertisement';
import PopunderAd from '../components/PopunderAd';

const Channels = () => {
  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Live TV Channels</h1>
        <p className="text-gray-300 mb-6">
          Watch international sports channels from around the world. Select a country and channel to start streaming.
        </p>
        
        {/* Single ad placement before channel grid */}
        <div className="mb-6">
          <Advertisement type="banner" className="w-full" />
        </div>
        
        <ChannelsGrid />
        
        {/* Non-intrusive popunder ad component */}
        <PopunderAd frequency={1800} /> {/* Show at most once every 30 minutes */}
      </div>
    </PageLayout>
  );
};

export default Channels;
