import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface ViewerCountProps {
  matchId: string;
  enableRealtime?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ViewerCount: React.FC<ViewerCountProps> = ({ matchId, enableRealtime = false, size = 'sm' }) => {
  const [viewerCount, setViewerCount] = useState<number>(0);
  const componentIdRef = useRef(`${Math.random().toString(36).substr(2, 9)}`);

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  useEffect(() => {
    if (!matchId) return;

    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Generate fake viewer base
    const generateFakeViewerBase = (matchId: string): number => {
      let hash = 0;
      for (let i = 0; i < matchId.length; i++) {
        hash = ((hash << 5) - hash) + matchId.charCodeAt(i);
        hash = hash & hash;
      }
      const base = 500 + (Math.abs(hash) % 1500);
      return base;
    };

    // Generate realistic fluctuation
    const generateFluctuation = (matchId: string): number => {
      const now = Date.now();
      const timeComponent = Math.floor(now / 10000);
      let seed = 0;
      for (let i = 0; i < matchId.length; i++) {
        seed += matchId.charCodeAt(i);
      }
      seed += timeComponent;
      const variation = ((seed * 9301 + 49297) % 233280) / 777.6 - 150;
      return Math.floor(variation);
    };

    // Fetch viewer count with fake viewers
    const fetchViewerCount = async () => {
      try {
        const { data: realCount, error } = await supabase.rpc('get_viewer_count', {
          match_id_param: matchId
        });
        
        const fakeBase = generateFakeViewerBase(matchId);
        const fluctuation = generateFluctuation(matchId);
        const realViewers = (!error && realCount !== null) ? realCount : 0;
        const totalCount = Math.max(500, fakeBase + fluctuation + realViewers);
        
        if (mounted) {
          setViewerCount(totalCount);
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error);
        // Show fake viewers even on error
        if (mounted) {
          const fakeBase = generateFakeViewerBase(matchId);
          const fluctuation = generateFluctuation(matchId);
          setViewerCount(Math.max(500, fakeBase + fluctuation));
        }
      }
    };

    fetchViewerCount();
    
    // Update count every 10 seconds for realistic fluctuation
    const fluctuationInterval = setInterval(fetchViewerCount, 10000);

    // Set up real-time subscription only if enabled
    if (enableRealtime) {
      // Use a unique channel name per component instance to avoid conflicts
      const channelName = `viewer_sessions:${matchId}:${componentIdRef.current}`;
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'viewer_sessions',
            filter: `match_id=eq.${matchId}`
          },
          () => {
            // When any session changes, re-fetch the count
            if (mounted) {
              fetchViewerCount();
            }
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      clearInterval(fluctuationInterval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId, enableRealtime]);

  // Always show viewers (minimum 500 with fake counts)
  if (viewerCount < 500) {
    return null;
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]} text-foreground`}>
      <Users className={iconSizes[size]} />
      <span className="font-semibold">{viewerCount.toLocaleString()}</span>
      <span className="hidden sm:inline">viewers</span>
    </div>
  );
};
