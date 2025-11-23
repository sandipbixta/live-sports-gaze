import { supabase } from "@/integrations/supabase/client";

export const leaguesService = {
  async fetchLeagues() {
    try {
      console.log('Fetching all sports leagues');
      
      const { data, error } = await supabase.functions.invoke('fetch-leagues', {
        body: {}
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
        query = query.ilike('sport', `%${sport.toLowerCase().replace(/\s+/g, '_')}%`);
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

  async fetchLeagueTeams(sportKey: string) {
    try {
      console.log(`Fetching teams for sport: ${sportKey}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-league-teams', {
        body: { sportKey }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching league teams:', error);
      return null;
    }
  },

  async getLeagueTeams(sportKey: string) {
    try {
      const { data, error } = await supabase
        .from('league_teams')
        .select('*')
        .eq('league_name', sportKey)
        .order('team_name');

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting league teams:', error);
      return [];
    }
  }
};
