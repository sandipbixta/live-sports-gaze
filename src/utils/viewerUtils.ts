import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches current viewer count for a match without starting tracking
 */
export const getMatchViewerCount = async (matchId: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_viewer_count', {
      match_id_param: matchId
    });
    
    if (error) {
      console.error('Error fetching viewer count:', error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error fetching viewer count:', error);
    return 0;
  }
};

/**
 * Fetches viewer counts for multiple matches in batch
 */
export const getBatchViewerCounts = async (matchIds: string[]): Promise<Record<string, number>> => {
  const results: Record<string, number> = {};
  
  // Process in batches to avoid overwhelming the database
  const batchSize = 10;
  for (let i = 0; i < matchIds.length; i += batchSize) {
    const batch = matchIds.slice(i, i + batchSize);
    
    const promises = batch.map(async (matchId) => {
      const count = await getMatchViewerCount(matchId);
      return { matchId, count };
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ matchId, count }) => {
      results[matchId] = count;
    });
  }
  
  return results;
};