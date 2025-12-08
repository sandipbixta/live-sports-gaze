import { useState, useEffect } from 'react';
import { CDNMatch, CDNMatchData } from '@/types/cdnMatch';

const CDN_MATCHES_API = 'https://cdn-live.tv/api/v1/matches';

export const useCDNMatches = () => {
  const [matches, setMatches] = useState<CDNMatch[]>([]);
  const [matchesBySport, setMatchesBySport] = useState<Record<string, CDNMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // For now, use static data - can be replaced with API call
        // const response = await fetch(CDN_MATCHES_API);
        // const data: CDNMatchData = await response.json();
        
        // Using the data structure from the provided JSON
        const data = (window as any).__CDN_MATCH_DATA__ as CDNMatchData | undefined;
        
        if (data && data['cdn-live-tv']) {
          const allMatches: CDNMatch[] = [];
          const bySport: Record<string, CDNMatch[]> = {};
          
          for (const [sport, sportMatches] of Object.entries(data['cdn-live-tv'])) {
            bySport[sport] = sportMatches;
            allMatches.push(...sportMatches);
          }
          
          setMatchesBySport(bySport);
          setMatches(allMatches);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch matches');
        console.error('Error fetching CDN matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const liveMatches = matches.filter(m => m.status === 'live');
  const finishedMatches = matches.filter(m => m.status === 'finished');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const getMatchById = (gameID: string): CDNMatch | undefined => {
    return matches.find(m => m.gameID === gameID);
  };

  const getMatchesWithChannels = (): CDNMatch[] => {
    return matches.filter(m => m.channels.length > 0);
  };

  return {
    matches,
    matchesBySport,
    liveMatches,
    finishedMatches,
    upcomingMatches,
    loading,
    error,
    getMatchById,
    getMatchesWithChannels,
  };
};
