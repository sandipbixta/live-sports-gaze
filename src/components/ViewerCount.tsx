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

    // Fetch viewer count
    const fetchViewerCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_viewer_count', {
          match_id_param: matchId
        });
        
        if (!error && data !== null && mounted) {
          setViewerCount(data);
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error);
      }
    };

    fetchViewerCount();

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
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId, enableRealtime]);

  // Don't show if 0 viewers
  if (viewerCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]} text-foreground`}>
      <Users className={iconSizes[size]} />
      <span className="font-semibold">{viewerCount.toLocaleString()}</span>
    </div>
  );
};
