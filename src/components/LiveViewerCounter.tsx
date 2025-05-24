
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const LiveViewerCounter = () => {
  const [viewerCount, setViewerCount] = useState(12847);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 20) + 1;
        const newCount = prev + (Math.random() > 0.5 ? change : -change);
        return Math.max(8000, Math.min(25000, newCount));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#242836] rounded-lg p-3 mb-4 border border-[#343a4d]">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm">Live Viewers</span>
        </div>
        <span className="text-lg font-semibold">{viewerCount.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default LiveViewerCounter;
