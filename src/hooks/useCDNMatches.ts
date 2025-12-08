import { useState, useEffect } from 'react';
import { CDNMatch, CDNMatchData } from '@/types/cdnMatch';

const CDN_MATCHES_API = 'https://api.cdn-live.tv/api/v1/events/sports/';

export const useCDNMatches = () => {
  const [matches, setMatches] = useState<CDNMatch[]>([]);
  const [matchesBySport, setMatchesBySport] = useState<Record<string, CDNMatch[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(CDN_MATCHES_API);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data: CDNMatchData = await response.json();
        
        if (data && data['cdn-live-tv']) {
          const allMatches: CDNMatch[] = [];
          const bySport: Record<string, CDNMatch[]> = {};
          
          for (const [sport, sportMatches] of Object.entries(data['cdn-live-tv'])) {
            // Skip non-array entries like total_events
            if (!Array.isArray(sportMatches)) continue;
            
            bySport[sport] = sportMatches;
            allMatches.push(...sportMatches);
          }
          
          setMatchesBySport(bySport);
          setMatches(allMatches);
          console.log(`✅ Loaded ${allMatches.length} CDN matches across ${Object.keys(bySport).length} sports`);
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
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
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
