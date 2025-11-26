import React, { useEffect, useState } from 'react';
import RevenueOptimizer from './RevenueOptimizer';

interface DeferredTrackersProps {
  pagePath: string;
  contentType: 'match' | 'live' | 'channels' | 'schedule' | 'news' | 'home' | 'blog';
}

/**
 * Deferred Trackers Component
 * Delays loading of non-critical tracking components to improve INP (Interaction to Next Paint)
 * Uses zero-delay setTimeout to defer execution until after main thread is free
 */
const DeferredTrackers: React.FC<DeferredTrackersProps> = ({ pagePath, contentType }) => {
  const [shouldLoadTrackers, setShouldLoadTrackers] = useState(false);

  useEffect(() => {
    // Defer tracker loading to improve INP
    // This ensures critical content renders first
    const timer = setTimeout(() => {
      setShouldLoadTrackers(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoadTrackers) {
    return null;
  }

  return <RevenueOptimizer pagePath={pagePath} contentType={contentType} />;
};

export default DeferredTrackers;
