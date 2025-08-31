import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types/sports';

interface MatchWithViewers extends Match {
  viewerCount?: number;
}

interface MatchWithViewersData {
  matchId: string;
  viewerCount: number;
}

export const useMatchesWithViewers = (matches: Match[]) => {
  const [matchesWithViewers, setMatchesWithViewers] = useState<MatchWithViewers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchesWithViewers = async () => {
      if (matches.length === 0) {
        setMatchesWithViewers([]);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching matches with viewers...');
        
        // Query to get active viewers (active in last 5 minutes) with count
        const { data: viewerCounts, error: viewersError } = await supabase
          .from('match_viewers')
          .select('match_id')
          .gte('last_active', new Date(Date.now() - 5 * 60 * 1000).toISOString());

        if (viewersError) {
          console.error('Error fetching active viewers:', viewersError);
          setMatchesWithViewers([]);
          setLoading(false);
          return;
        }

        if (!viewerCounts || viewerCounts.length === 0) {
          console.log('📊 No active viewers found');
          setMatchesWithViewers([]);
          setLoading(false);
          return;
        }

        // Count viewers per match from the database results
        const viewerCountsByMatch = viewerCounts.reduce((acc: Record<string, number>, viewer) => {
          acc[viewer.match_id] = (acc[viewer.match_id] || 0) + 1;
          return acc;
        }, {});

        // Only include matches that actually have viewers in the database
        const matchViewerCounts: MatchWithViewersData[] = Object.entries(viewerCountsByMatch)
          .map(([matchId, count]) => ({
            matchId,
            viewerCount: count as number
          }))
          .filter(mvc => mvc.viewerCount > 0);

        console.log('🔍 Actual viewer counts from DB:', matchViewerCounts);

        // Filter and sort matches by viewer count - only include matches with viewers > 0
        const filteredMatches: MatchWithViewers[] = matches
          .filter(match => matchViewerCounts.some(mvc => mvc.matchId === match.id))
          .map(match => {
            const viewerData = matchViewerCounts.find(mvc => mvc.matchId === match.id);
            const viewerCount = viewerData?.viewerCount || 0;
            return {
              ...match,
              viewerCount
            };
          })
          .filter(match => match.viewerCount > 0) // Only include matches with actual viewers
          .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));

        console.log(`👥 Found ${filteredMatches.length} matches with viewers`);
        setMatchesWithViewers(filteredMatches);
      } catch (error) {
        console.error('Error in fetchMatchesWithViewers:', error);
        setMatchesWithViewers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesWithViewers();
  }, [matches]);

  return { matchesWithViewers, loading };
};