import { supabase } from "@/integrations/supabase/client";

export interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: string;
  flag: string;
}

export interface LiveMatch {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

export const apiSportsService = {
  async getLeagues(country?: string) {
    try {
      const params: any = {};
      if (country) params.country = country;

      const { data, error } = await supabase.functions.invoke('api-sports', {
        body: { 
          endpoint: '/leagues',
          params
        }
      });

      if (error) throw error;
      return data?.response || [];
    } catch (error) {
      console.error('Error fetching leagues:', error);
      throw error;
    }
  },

  async getLiveMatches() {
    try {
      const { data, error } = await supabase.functions.invoke('api-sports', {
        body: { 
          endpoint: '/fixtures',
          params: {
            live: 'all'
          }
        }
      });

      if (error) throw error;
      return data?.response || [];
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  },

  async getMatchesByDate(date: string) {
    try {
      const { data, error } = await supabase.functions.invoke('api-sports', {
        body: { 
          endpoint: '/fixtures',
          params: {
            date // Format: YYYY-MM-DD
          }
        }
      });

      if (error) throw error;
      return data?.response || [];
    } catch (error) {
      console.error('Error fetching matches by date:', error);
      throw error;
    }
  },

  async getMatchesByLeague(leagueId: number, season: number) {
    try {
      const { data, error } = await supabase.functions.invoke('api-sports', {
        body: { 
          endpoint: '/fixtures',
          params: {
            league: leagueId,
            season
          }
        }
      });

      if (error) throw error;
      return data?.response || [];
    } catch (error) {
      console.error('Error fetching matches by league:', error);
      throw error;
    }
  },

  async getMatchStatistics(fixtureId: number) {
    try {
      const { data, error } = await supabase.functions.invoke('api-sports', {
        body: { 
          endpoint: '/fixtures/statistics',
          params: {
            fixture: fixtureId
          }
        }
      });

      if (error) throw error;
      return data?.response || [];
    } catch (error) {
      console.error('Error fetching match statistics:', error);
      throw error;
    }
  },

  async searchTeams(teamName: string) {
    try {
      const { data, error } = await supabase.functions.invoke('api-sports', {
        body: { 
          endpoint: '/teams',
          params: {
            search: teamName
          }
        }
      });

      if (error) throw error;
      return data?.response || [];
    } catch (error) {
      console.error('Error searching teams:', error);
      throw error;
    }
  }
};
