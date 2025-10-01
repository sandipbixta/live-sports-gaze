import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to track viewer count for a match
 * Increments count when component mounts, decrements when it unmounts
 */
export const useViewerTracking = (matchId: string | undefined) => {
  useEffect(() => {
    if (!matchId) return;

    let isActive = true;

    // Increment viewer count when user starts watching
    const incrementViewer = async () => {
      try {
        const { data, error } = await supabase.rpc('increment_viewer_count', {
          match_id_param: matchId
        });
        
        if (error) {
          console.error('Error incrementing viewer count:', error);
        } else {
          console.log(`Viewer count for ${matchId}:`, data);
        }
      } catch (error) {
        console.error('Error incrementing viewer count:', error);
      }
    };

    // Decrement viewer count when user stops watching
    const decrementViewer = async () => {
      if (!isActive) return;
      
      try {
        const { data, error } = await supabase.rpc('decrement_viewer_count', {
          match_id_param: matchId
        });
        
        if (error) {
          console.error('Error decrementing viewer count:', error);
        } else {
          console.log(`Viewer left ${matchId}, new count:`, data);
        }
      } catch (error) {
        console.error('Error decrementing viewer count:', error);
      }
    };

    // Track viewer when component mounts
    incrementViewer();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        decrementViewer();
      } else {
        incrementViewer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: decrement viewer count when component unmounts
    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      decrementViewer();
    };
  }, [matchId]);
};
