import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface ViewerCountProps {
  matchId: string;
}

export const ViewerCount: React.FC<ViewerCountProps> = ({ matchId }) => {
  const [viewerCount, setViewerCount] = useState<number>(0);

  useEffect(() => {
    // Fetch initial viewer count
    const fetchViewerCount = async () => {
      const { data, error } = await supabase.rpc('get_viewer_count', {
        match_id_param: matchId
      });
      
      if (!error && data !== null) {
        setViewerCount(data);
      }
    };

    fetchViewerCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`match_viewers_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_viewers',
          filter: `match_id=eq.${matchId}`
        },
        (payload: any) => {
          if (payload.new?.viewer_count !== undefined) {
            setViewerCount(payload.new.viewer_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/90 text-white rounded-lg w-fit">
      <Users className="w-4 h-4" />
      <span className="font-semibold">{viewerCount.toLocaleString()}</span>
    </div>
  );
};
