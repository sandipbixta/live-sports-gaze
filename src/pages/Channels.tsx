
import React from 'react';
import PageLayout from '../components/PageLayout';
import ChannelsGrid from '../components/ChannelsGrid';

const Channels = () => {
  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Live TV Channels</h1>
        <p className="text-gray-300 mb-6">
          Watch international sports channels from around the world. Select a country and channel to start streaming.
        </p>
        
        <ChannelsGrid />
      </div>
    </PageLayout>
  );
};

export default Channels;
