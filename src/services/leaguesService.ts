import { supabase } from "@/integrations/supabase/client";

export const leaguesService = {
  async fetchLeagues(sport: string) {
    try {
      console.log(`Fetching leagues for ${sport}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-leagues', {
        body: { sport }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return null;
    }
  },

  async getLeagues(sport?: string) {
    try {
      let query = supabase
        .from('leagues')
        .select('*')
        .order('league_name');
      
      if (sport) {
        query = query.eq('sport', sport.toLowerCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting leagues:', error);
      return [];
    }
  },

  async getLeagueById(leagueId: string) {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('league_id', leagueId)
        .maybeSingle();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting league:', error);
      return null;
    }
  },

  async fetchLeagueTeams(leagueName: string) {
    try {
      console.log(`Fetching teams for league: ${leagueName}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-league-teams', {
        body: { leagueName }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching league teams:', error);
      return null;
    }
  },

  async getLeagueTeams(leagueName: string) {
    try {
      const { data, error } = await supabase
        .from('league_teams')
        .select('*')
        .eq('league_name', leagueName)
        .order('team_name');

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting league teams:', error);
      return [];
    }
  }
};
