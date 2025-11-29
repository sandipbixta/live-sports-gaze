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
  const cacheKey = 'finished-matches';
  const cached = getCachedData<FootballMatch[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('fetch-finished-matches');
  if (error) throw error;
  
  setCachedData(cacheKey, data);
  return data;
};

export const fetchLiveMatches = async (): Promise<FootballMatch[]> => {
  const cacheKey = 'live-matches';
  const cached = getCachedData<FootballMatch[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'live' }
  });
  if (error) throw error;
  
  setCachedData(cacheKey, data);
  return data;
};

export const fetchUpcomingMatches = async (): Promise<FootballMatch[]> => {
  const cacheKey = 'upcoming-matches';
  const cached = getCachedData<FootballMatch[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'upcoming' }
  });
  if (error) throw error;
  
  setCachedData(cacheKey, data);
  return data;
};

export const fetchLeagueStandings = async (competitionId: number) => {
  const cacheKey = `standings-${competitionId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'standings', competitionId }
  });
  if (error) throw error;
  
  setCachedData(cacheKey, data);
  return data;
};

export const fetchTopScorers = async (competitionId: number) => {
  const cacheKey = `scorers-${competitionId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('fetch-football-data', {
    body: { endpoint: 'scorers', competitionId }
  });
  if (error) throw error;
  
  setCachedData(cacheKey, data);
  return data;
};
