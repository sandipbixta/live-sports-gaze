import { supabase } from "@/integrations/supabase/client";

export const statsService = {
  async fetchTeamStats(teamName: string, sport: string) {
    try {
      console.log(`Fetching stats for ${teamName} in ${sport}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-team-stats', {
        body: { teamName, sport }
      });

      if (error) throw error;
      
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