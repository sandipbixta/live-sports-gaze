import { supabase } from "@/integrations/supabase/client";

export const matchesService = {
  async fetchUpcomingMatches(sportKey: string) {
    try {
      console.log(`Fetching upcoming matches for: ${sportKey}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-league-matches', {
        body: { sportKey }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return { success: false, message: error.message || 'Failed to fetch matches', matches: [] };
    }
  },

  async fetchRecentScores(sportKey: string) {
    try {
      console.log(`Fetching recent scores for: ${sportKey}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-league-scores', {
        body: { sportKey }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching recent scores:', error);
      return { success: false, message: error.message || 'Failed to fetch scores', scores: [] };
    }
  }
};