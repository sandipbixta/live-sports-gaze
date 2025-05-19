
import React from 'react';
import { Button } from '../ui/button';
import { Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChannelsPromo: React.FC = () => {
  return (
    <Link to="/channels" className="block w-full">
      <div className="bg-[#242836] hover:bg-[#2a2f3f] border border-[#343a4d] rounded-xl p-6 text-center transition-all">
        <Radio className="h-10 w-10 text-[#fa2d04] mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-white">Live TV Channels</h3>
        <p className="text-gray-300 mt-2">Access 70+ international sports channels from around the world</p>
        <Button className="mt-4 bg-[#fa2d04] hover:bg-[#e02703]">Browse Channels</Button>
      </div>
    </Link>
  );
};

export default ChannelsPromo;
