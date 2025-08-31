import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface ViewerTrackingResult {
  viewerCount: number;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

export const useViewerTracking = (matchId: string | null): ViewerTrackingResult => {
  const [viewerCount, setViewerCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const sessionId = useRef(generateSessionId());
  const intervalRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>();

  // Generate unique session ID
  function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Optimized viewer count fetching with debouncing
  const fetchViewerCount = async (currentMatchId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_viewer_count', {
        match_id_param: currentMatchId
      });
      
      if (error) return;
      setViewerCount(data || 0);
    } catch (error) {
      // Silent fail to reduce console spam
    }
  };

  // Start tracking viewers for a match
  const startTracking = async () => {
    if (!matchId || isTracking) return;
    setIsTracking(true);

    try {
      // Add viewer to database
      await supabase.from('match_viewers').upsert({
        match_id: matchId,
        session_id: sessionId.current,
        last_active: new Date().toISOString()
      });

      // Set up real-time listener for viewer changes
      channelRef.current = supabase
        .channel(`match_viewers_${matchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_viewers',
            filter: `match_id=eq.${matchId}`
          },
           (payload: RealtimePostgresChangesPayload<any>) => {
            // Debounce viewer count updates
            setTimeout(() => fetchViewerCount(matchId), 500);
          }
        )
        .subscribe();

      // Update last_active every 30 seconds (reduced frequency)
      intervalRef.current = setInterval(async () => {
        try {
          await supabase
            .from('match_viewers')
            .update({ last_active: new Date().toISOString() })
            .eq('match_id', matchId)
            .eq('session_id', sessionId.current);
        } catch (error) {
          // Silent fail to reduce performance impact
        }
      }, 30000);

      // Initial viewer count fetch
      await fetchViewerCount(matchId);

    } catch (error) {
      console.error('Error starting viewer tracking:', error);
      setIsTracking(false);
    }
  };

  // Stop tracking viewers
  const stopTracking = async () => {
    if (!matchId || !isTracking) return;
    setIsTracking(false);

    try {
      // Remove viewer from database
      await supabase
        .from('match_viewers')
        .delete()
        .eq('match_id', matchId)
        .eq('session_id', sessionId.current);

      // Clean up interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }

      // Clean up real-time subscription
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setViewerCount(0);
    } catch (error) {
      console.error('Error stopping viewer tracking:', error);
    }
  };

  // Clean up on unmount or match change
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, []);

  // Handle match ID changes
  useEffect(() => {
    if (isTracking) {
      stopTracking().then(() => {
        if (matchId) {
          startTracking();
        }
      });
    }
  }, [matchId]);

  return {
    viewerCount,
    isTracking,
    startTracking,
    stopTracking
  };
};