
import React, { useState, useEffect } from 'react';
import { Users, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WatchPartyIndicatorProps {
  matchTitle: string;
  isPopular?: boolean;
}

const WatchPartyIndicator: React.FC<WatchPartyIndicatorProps> = ({ matchTitle, isPopular = false }) => {
  const [partyCount, setPartyCount] = useState(Math.floor(Math.random() * 500) + 50);
  const [showJoinEffect, setShowJoinEffect] = useState(false);

  useEffect(() => {
    if (isPopular) {
      const interval = setInterval(() => {
        setPartyCount(prev => prev + Math.floor(Math.random() * 5) + 1);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isPopular]);

  const handleJoinParty = () => {
    setShowJoinEffect(true);
    setPartyCount(prev => prev + 1);
    setTimeout(() => setShowJoinEffect(false), 1000);
  };

  if (!isPopular) return null;

  return (
    <div className="bg-[#242836] rounded-lg p-3 border border-[#343a4d] mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-white font-medium">Watch Party</span>
          <Badge variant="secondary" className="bg-purple-600 text-white">
            <Users className="h-3 w-3 mr-1" />
            {partyCount}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleJoinParty}
          className={`bg-purple-600 border-purple-600 text-white hover:bg-purple-700 text-xs transition-all duration-300 ${
            showJoinEffect ? 'scale-110 bg-green-600' : ''
          }`}
        >
          {showJoinEffect ? '✓ Joined!' : 'Join Party'}
        </Button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Watch with fans and chat live!
      </p>
    </div>
  );
};

export default WatchPartyIndicator;
