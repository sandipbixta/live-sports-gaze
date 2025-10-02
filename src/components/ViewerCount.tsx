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

    // Fetch viewer count once (no real-time subscription for match cards)
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

    return () => {
      mounted = false;
    };
  }, [matchId]);

  return (
    <div className="flex items-center gap-2 text-foreground">
      <Users className="w-4 h-4" />
      <span className="font-semibold">{viewerCount.toLocaleString()}</span>
    </div>
  );
};
