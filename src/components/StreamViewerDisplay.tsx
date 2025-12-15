import React, { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Eye, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
interface StreamViewerDisplayProps {
  matchId: string;
  isLive?: boolean;
  className?: string;
}
const StreamViewerDisplay: React.FC<StreamViewerDisplayProps> = ({
  matchId,
  isLive = true,
  className
}) => {
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousCountRef = useRef<number>(0);
  useEffect(() => {
    if (!matchId) return;
    let mounted = true;
    const fetchViewerCount = async () => {
      try {
        const {
          data,
          error
        } = await supabase.rpc('get_viewer_count', {
          match_id_param: matchId
        });
        if (!error && data !== null && mounted) {
          if (data !== previousCountRef.current) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);
          }
          previousCountRef.current = data;
          setViewerCount(data);
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error);
      }
    };

    // Initial fetch
    fetchViewerCount();

    // Update every 15 seconds for more real-time feel
    const interval = setInterval(fetchViewerCount, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [matchId]);
  return;
};
export default StreamViewerDisplay;