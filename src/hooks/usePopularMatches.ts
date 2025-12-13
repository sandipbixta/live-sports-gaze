import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/queryClient';

export interface PopularMatch {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge?: string;
  awayTeamBadge?: string;
  homeScore?: string;
  awayScore?: string;
  sport: string;
  sportIcon: string;
  league: string;
  leagueId: string;
  date: string;
  time: string;
  timestamp: string;
  status: string;
  progress: string;
  isLive: boolean;
  isFinished: boolean;
  channels: Array<{
    id: string;
    name: string;
    logo: string;
    embedUrl: string;
  }>;
  priority: number;
}

// Memory cache for instant access
let cachedMatches: PopularMatch[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const fetchPopularMatches = async (): Promise<PopularMatch[]> => {
  // Return memory cache if fresh
  if (cachedMatches && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('⚡ Using memory cache for popular matches');
    return cachedMatches;
  }

  console.log('🌐 Fetching fresh popular matches...');
  
  const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
  
  if (error) {
    console.error('Error fetching popular matches:', error);
    // Return stale cache if available
    if (cachedMatches) {
      console.log('⚠️ Using stale cache due to error');
      return cachedMatches;
    }
    throw error;
  }
  
  const matches = data?.matches || [];
  
  // Update memory cache
  cachedMatches = matches;
  cacheTimestamp = Date.now();
  
  return matches;
};

export const usePopularMatches = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.POPULAR_MATCHES,
    queryFn: fetchPopularMatches,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    refetchOnWindowFocus: false,
    // Return cached data immediately while fetching
    initialData: cachedMatches || undefined,
  });
};

// Preload function - call on app init
export const preloadPopularMatches = () => {
  fetchPopularMatches().catch(console.error);
};
