import { useState, useEffect, useCallback } from 'react';
import { getFeaturedMatches } from '../services/featuredMatchesService';

export const useFeaturedMatches = (limit: number = 8, refreshInterval: number = 120000) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await getFeaturedMatches(limit);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError('Failed to load featured matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchMatches();
    
    // Refresh every 2 minutes
    const intervalId = setInterval(fetchMatches, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchMatches, refreshInterval]);

  return { matches, loading, error, refresh: fetchMatches };
};
