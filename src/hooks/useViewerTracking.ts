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

  // Fetch current viewer count
  const fetchViewerCount = async (currentMatchId: string) => {
    try {
      console.log(`📊 Fetching viewer count for match: ${currentMatchId}`);
      const { data, error } = await supabase.rpc('get_viewer_count', {
        match_id_param: currentMatchId
      });
      
      if (error) {
        console.error('Error fetching viewer count:', error);
        return;
      }
      
      console.log(`👥 Viewer count for ${currentMatchId}: ${data}`);
      setViewerCount(data || 0);
    } catch (error) {
      console.error('Error fetching viewer count:', error);
    }
  };

  // Start tracking viewers for a match
  const startTracking = async () => {
    if (!matchId || isTracking) {
      console.log(`⚠️ Cannot start tracking. MatchId: ${matchId}, isTracking: ${isTracking}`);
      return;
    }

    console.log(`🔴 Starting viewer tracking for match: ${matchId}`);
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
            console.log('👥 Viewer change detected:', payload.eventType);
            fetchViewerCount(matchId);
          }
        )
        .subscribe();

      // Update last_active every 10 seconds
      intervalRef.current = setInterval(async () => {
        try {
          await supabase
            .from('match_viewers')
            .update({ last_active: new Date().toISOString() })
            .eq('match_id', matchId)
            .eq('session_id', sessionId.current);
        } catch (error) {
          console.error('Error updating last_active:', error);
        }
      }, 10000);

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

    console.log(`⏹️ Stopping viewer tracking for match: ${matchId}`);
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