import { supabase } from "@/integrations/supabase/client";

export interface FootballTeam {
  name: string;
  logo: string | null;
  shortName?: string;
}

export interface FootballScore {
  home: number;
  away: number;
}

export interface FootballCompetition {
  id: number;
  name: string;
  logo: string | null;
  code?: string;
}

export interface FootballMatch {
  id: number;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  score: FootballScore;
  competition: FootballCompetition;
  utcDate: string;
  status: 'FINISHED' | 'LIVE' | 'SCHEDULED' | 'TIMED';
  minute?: number;
}

export const fetchFinishedMatches = async (): Promise<FootballMatch[]> => {
  const { data, error } = await supabase.functions.invoke('fetch-finished-matches');
  if (error) throw error;
  return data;
};

export const fetchLiveMatches = async (): Promise<FootballMatch[]> => {
  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'live' }
  });
  if (error) throw error;
  return data;
};

export const fetchUpcomingMatches = async (): Promise<FootballMatch[]> => {
  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'upcoming' }
  });
  if (error) throw error;
  return data;
};

export const fetchLeagueStandings = async (competitionId: number) => {
  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'standings', competitionId }
  });
  if (error) throw error;
  return data;
};

export const fetchTopScorers = async (competitionId: number) => {
  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'scorers', competitionId }
  });
  if (error) throw error;
  return data;
};
