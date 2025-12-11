import { useState, useEffect } from 'react';
import { getFeaturedMatches } from '../services/featuredMatchesService';

export const useFeaturedMatches = (limit: number = 6) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedMatches(limit);
        setMatches(data);
        setError(null);
      } catch (err) {
        setError('Failed to load featured matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchMatches, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [limit]);

  return { matches, loading, error };
};
