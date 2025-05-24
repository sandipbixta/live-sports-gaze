
import React from 'react';

interface WatchPartyIndicatorProps {
  matchTitle: string;
  isPopular?: boolean;
}

const WatchPartyIndicator: React.FC<WatchPartyIndicatorProps> = ({ matchTitle, isPopular = false }) => {
  if (!isPopular) return null;

  return (
    <div className="bg-[#242836] rounded p-2 border border-[#343a4d] mt-2">
      <div className="text-xs text-gray-300">
        Join others watching this match
      </div>
    </div>
  );
};

export default WatchPartyIndicator;
