import { supabase } from "@/integrations/supabase/client";
import { Match } from '../types/sports';

export const fetchMatchViewerCounts = async (matchIds: string[]): Promise<Map<string, number>> => {
  const viewerCounts = new Map<string, number>();
  
  try {
    // Fetch viewer counts for all matches at once
    const { data, error } = await supabase
      .rpc('get_viewer_count', { match_id_param: 'batch' });
    
    if (error) {
      console.error('Error fetching viewer counts:', error);
      return viewerCounts;
    }

    // For now, use a simplified approach - get individual counts
    const promises = matchIds.map(async (matchId) => {
      try {
        const { data: count, error: countError } = await supabase
          .rpc('get_viewer_count', { match_id_param: matchId });
        
        if (!countError && count !== null) {
          viewerCounts.set(matchId, count);
        }
      } catch (err) {
        console.error(`Error fetching viewer count for match ${matchId}:`, err);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in fetchMatchViewerCounts:', error);
  }

  return viewerCounts;
};

export const enrichMatchesWithViewerCounts = async (matches: Match[]): Promise<Match[]> => {
  if (matches.length === 0) return matches;

  const matchIds = matches.map(match => match.id);
  const viewerCounts = await fetchMatchViewerCounts(matchIds);

  return matches.map(match => ({
    ...match,
    viewerCount: viewerCounts.get(match.id) || 0
  }));
};