import { supabase } from "@/integrations/supabase/client";

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const statsService = {
  async fetchTeamStats(teamName: string, sport: string) {
    try {
      const cacheKey = `team-stats-${sport}-${teamName}`;
      const cached = getCachedData(cacheKey);
      if (cached) return cached;

      console.log(`Fetching stats for ${teamName} in ${sport}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-team-stats', {
        body: { teamName, sport }
      });

      if (error) throw error;
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return null;
    }
  },

  async getTeamStats(teamName: string, sport: string) {
    try {
      // First check if we have stats in the database
      const { data, error } = await supabase
        .from('team_stats')
        .select('*')
        .eq('team_name', teamName)
        .eq('sport', sport.toLowerCase())
        .single();

      if (error || !data) {
        // If not found, fetch from API
        console.log('Stats not in DB, fetching from API');
        await this.fetchTeamStats(teamName, sport);
        
        // Try to get from DB again
        const { data: newData } = await supabase
          .from('team_stats')
          .select('*')
          .eq('team_name', teamName)
          .eq('sport', sport.toLowerCase())
          .single();
        
        return newData;
      }

      return data;
    } catch (error) {
      console.error('Error getting team stats:', error);
      return null;
    }
  }
};