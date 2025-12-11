import { useState, useEffect, useCallback } from 'react';
import { getLivescores } from '../services/sportsLogoService';

interface LiveScore {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | string;
  awayScore: number | string;
  progress: string;
  status: string;
}

// Global store for live scores
const liveScoresStore = new Map<string, LiveScore>();
let lastFetchTime = 0;
const FETCH_COOLDOWN = 30000; // 30 seconds

// Sport mapping for API
const sportApiMap: Record<string, string> = {
  'football': 'soccer',
  'soccer': 'soccer',
  'basketball': 'basketball',
  'nba': 'basketball',
  'hockey': 'hockey',
  'ice hockey': 'hockey',
  'nhl': 'hockey',
  'nfl': 'nfl',
  'american football': 'nfl',
  'baseball': 'baseball',
  'mlb': 'baseball',
  'rugby': 'rugby',
  'mma': 'fighting',
  'ufc': 'fighting',
  'boxing': 'fighting',
  'cricket': 'cricket',
  'tennis': 'tennis',
};

export const useLiveScoreUpdates = (refreshInterval: number = 30000) => {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllScores = useCallback(async () => {
    // Prevent too frequent fetches
    if (Date.now() - lastFetchTime < FETCH_COOLDOWN) {
      return;
    }
    
    setIsLoading(true);
    lastFetchTime = Date.now();
    
    const sports = ['soccer', 'basketball', 'hockey', 'nfl', 'baseball', 'rugby', 'fighting'];
    
    try {
      const results = await Promise.all(
        sports.map(sport => getLivescores(sport).catch(() => []))
      );
      
      const allScores = results.flat();
      
      allScores.forEach(score => {
        if (score.idEvent || score.strEvent) {
          const key = score.idEvent || `${score.strHomeTeam}_${score.strAwayTeam}`;
          liveScoresStore.set(key, {
            eventId: score.idEvent || '',
            homeTeam: score.strHomeTeam || '',
            awayTeam: score.strAwayTeam || '',
            homeScore: score.intHomeScore ?? '-',
            awayScore: score.intAwayScore ?? '-',
            progress: score.strProgress || score.strStatus || '',
            status: score.strStatus || ''
          });
        }
      });
      
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch live scores:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAllScores();
    
    // Set up interval
    const intervalId = setInterval(fetchAllScores, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchAllScores, refreshInterval]);

  return { lastUpdate, isLoading, refresh: fetchAllScores };
};

// Get live score by event ID
export const getLiveScoreById = (eventId: string): LiveScore | null => {
  return liveScoresStore.get(eventId) || null;
};

// Get live score by matching team names
export const getLiveScoreByTeams = (homeTeam: string, awayTeam: string): LiveScore | null => {
  if (!homeTeam || !awayTeam) return null;
  
  const normalizedHome = homeTeam.toLowerCase().trim();
  const normalizedAway = awayTeam.toLowerCase().trim();
  
  for (const score of liveScoresStore.values()) {
    const scoreHome = (score.homeTeam || '').toLowerCase().trim();
    const scoreAway = (score.awayTeam || '').toLowerCase().trim();
    
    // Check for partial match
    if (
      (scoreHome.includes(normalizedHome) || normalizedHome.includes(scoreHome)) &&
      (scoreAway.includes(normalizedAway) || normalizedAway.includes(scoreAway))
    ) {
      return score;
    }
  }
  
  return null;
};

// Hook for individual match score
export const useMatchScore = (homeTeam: string, awayTeam: string, isLive: boolean) => {
  const [score, setScore] = useState<{ home: number | string; away: number | string; progress: string } | null>(null);
  
  useEffect(() => {
    if (!isLive || !homeTeam || !awayTeam) {
      setScore(null);
      return;
    }
    
    const checkScore = () => {
      const liveScore = getLiveScoreByTeams(homeTeam, awayTeam);
      if (liveScore) {
        setScore({
          home: liveScore.homeScore,
          away: liveScore.awayScore,
          progress: liveScore.progress
        });
      }
    };
    
    checkScore();
    
    // Check every 5 seconds for updates from the global store
    const intervalId = setInterval(checkScore, 5000);
    
    return () => clearInterval(intervalId);
  }, [homeTeam, awayTeam, isLive]);
  
  return score;
};

// Get API sport name
export const getApiSportName = (sport: string): string => {
  const key = sport?.toLowerCase() || 'soccer';
  return sportApiMap[key] || 'soccer';
};
