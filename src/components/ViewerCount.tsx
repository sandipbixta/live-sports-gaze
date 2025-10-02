import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface ViewerCountProps {
  matchId: string;
}

export const ViewerCount: React.FC<ViewerCountProps> = ({ matchId }) => {
  const [viewerCount, setViewerCount] = useState<number>(0);

  useEffect(() => {
    if (!matchId) return;

    let mounted = true;

    // Fetch initial viewer count
    const fetchViewerCount = async () => {
      const { data, error } = await supabase.rpc('get_viewer_count', {
        match_id_param: matchId
      });
      
      if (!error && data !== null && mounted) {
        setViewerCount(data);
      }
    };

    fetchViewerCount();

    // Create unique channel name with timestamp to avoid conflicts
    const channelName = `match_viewers_${matchId}_${Date.now()}`;
    
    // Subscribe to real-time updates
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
  }, [matchId]);

  return (
    <div className="flex items-center gap-2 text-foreground">
      <Users className="w-4 h-4" />
      <span className="font-semibold">{viewerCount.toLocaleString()}</span>
    </div>
  );
};
