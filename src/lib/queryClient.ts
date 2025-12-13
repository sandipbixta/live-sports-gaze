import { QueryClient } from "@tanstack/react-query";

// Optimized query client with aggressive caching for performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus - reduces unnecessary API calls
      refetchOnWindowFocus: false,
      // Only retry once on failure
      retry: 1,
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 15 minutes (v4 uses cacheTime)
      cacheTime: 15 * 60 * 1000,
      // Don't refetch on mount if data exists
      refetchOnMount: false,
      // Don't refetch on reconnect automatically
      refetchOnReconnect: false,
    },
  },
});

// Query keys for consistent caching
export const QUERY_KEYS = {
  POPULAR_MATCHES: ['popular-matches'] as const,
  LIVE_MATCHES: ['live-matches'] as const,
  LIVE_SCORES: (sport: string) => ['live-scores', sport] as const,
  SPORTS: ['sports'] as const,
  CHANNELS: ['channels'] as const,
  CHANNEL_STREAM: (name: string, code: string) => ['channel-stream', name, code] as const,
  HIGHLIGHTS: ['highlights'] as const,
  LEAGUES: ['leagues'] as const,
  LEAGUE_DETAIL: (id: string) => ['league-detail', id] as const,
  MATCH_DETAIL: (sportId: string, matchId: string) => ['match-detail', sportId, matchId] as const,
  TEAM_STATS: (team: string, sport: string) => ['team-stats', team, sport] as const,
} as const;

// Prefetch data for faster navigation
export const prefetchQueries = async () => {
  // These will be called on app load to pre-warm the cache
  console.log('🚀 Prefetching critical data...');
};
