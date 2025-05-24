
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LiveViewerCounter = () => {
  const [viewerCount, setViewerCount] = useState(12847);
  const [isIncreasing, setIsIncreasing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 50) + 1;
        const newCount = isIncreasing ? prev + change : prev - change;
        
        // Switch direction occasionally
        if (Math.random() < 0.1) {
          setIsIncreasing(!isIncreasing);
        }
        
        return Math.max(8000, Math.min(25000, newCount));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isIncreasing]);

  return (
    <div className="bg-gradient-to-r from-[#ff5a36] to-[#e64d2e] rounded-lg p-3 mb-4 animate-pulse">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="font-semibold">Live Viewers</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold">{viewerCount.toLocaleString()}</span>
          <TrendingUp className={`h-4 w-4 ${isIncreasing ? 'text-green-300' : 'text-red-300'}`} />
        </div>
      </div>
      <div className="text-xs text-white/80 mt-1">
        Watching live sports right now!
      </div>
    </div>
  );
};

export default LiveViewerCounter;
