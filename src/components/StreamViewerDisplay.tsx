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
        const { data, error } = await supabase.rpc('get_viewer_count', {
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

  return (
    <Card className={cn(
      'bg-sports-card border-border p-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Currently Watching</p>
            <div className="flex items-center gap-2">
              <span 
                className={cn(
                  'text-2xl font-bold text-foreground transition-transform duration-300',
                  isAnimating && 'scale-110'
                )}
              >
                {viewerCount.toLocaleString()}
              </span>
              {isLive && viewerCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
        </div>
        
        {viewerCount > 100 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              {viewerCount > 1000 ? 'Trending' : 'Popular'}
            </span>
          </div>
        )}
      </div>
      
      {viewerCount > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          <Radio className="w-3 h-3 inline mr-1" />
          Viewer count updates every 15 seconds
        </p>
      )}
    </Card>
  );
};

export default StreamViewerDisplay;
