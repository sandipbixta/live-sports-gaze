import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface ViewerCountProps {
  matchId: string;
  enableRealtime?: boolean;
}

export const ViewerCount: React.FC<ViewerCountProps> = ({ matchId, enableRealtime = false }) => {
  const [viewerCount, setViewerCount] = useState<number>(0);

  useEffect(() => {
    if (!matchId) return;

    let mounted = true;

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
      const channelName = `match_viewers_${matchId}_${Date.now()}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_viewers',
            filter: `match_id=eq.${matchId}`
          },
          (payload: any) => {
            if (mounted && payload.new?.viewer_count !== undefined) {
              setViewerCount(payload.new.viewer_count);
            }
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        channel.unsubscribe().then(() => {
          supabase.removeChannel(channel);
        });
      };
    }

    return () => {
      mounted = false;
    };
  }, [matchId, enableRealtime]);

  // Don't show if 0 viewers
  if (viewerCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-xs text-foreground">
      <Users className="w-3 h-3" />
      <span className="font-semibold">{viewerCount.toLocaleString()}</span>
      <span className="hidden sm:inline">viewers</span>
    </div>
  );
};
