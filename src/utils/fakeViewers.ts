// Generate fake but realistic viewer counts for live matches
export const generateFakeViewerCount = (matchId: string, isLive: boolean = false): number => {
  if (!isLive) return 0;
  
  // Create a deterministic seed from match ID for consistent counts
  const seed = matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use seed to generate consistent "random" numbers
  const pseudoRandom = (seed: number, factor: number = 1) => {
    return ((seed * factor * 9301 + 49297) % 233280) / 233280;
  };
  
  // Base viewer count (100-2000)
  const baseViewers = Math.floor(pseudoRandom(seed, 1) * 1900) + 100;
  
  // Add time-based variation (peak hours get more viewers)
  const hour = new Date().getHours();
  let timeMultiplier = 1;
  
  if (hour >= 19 && hour <= 23) { // Evening peak
    timeMultiplier = 1.5;
  } else if (hour >= 14 && hour <= 18) { // Afternoon
    timeMultiplier = 1.2;
  } else if (hour >= 6 && hour <= 11) { // Morning
    timeMultiplier = 0.8;
  } else { // Late night/early morning
    timeMultiplier = 0.6;
  }
  
  // Add match popularity based on title keywords
  const popularKeywords = ['premier', 'champions', 'final', 'derby', 'clasico', 'el clasico', 'manchester', 'liverpool', 'barcelona', 'real madrid', 'psg', 'bayern'];
  let popularityBonus = 1;
  
  const matchTitle = matchId.toLowerCase();
  for (const keyword of popularKeywords) {
    if (matchTitle.includes(keyword)) {
      popularityBonus += 0.3;
    }
  }
  
  // Add some randomness for "live" fluctuation - changes every 10-15 seconds
  const now = Date.now();
  const fluctuationInterval = 12000; // 12 seconds
  const currentCycle = Math.floor(now / fluctuationInterval);
  const cycleFluctuation = 1 + (pseudoRandom(seed, currentCycle) - 0.5) * 0.15; // ±7.5% major changes
  
  // Add micro-fluctuations every few seconds (people joining/leaving)
  const microInterval = 4000; // 4 seconds  
  const microCycle = Math.floor(now / microInterval);
  const microFluctuation = 1 + (pseudoRandom(seed, microCycle * 3) - 0.5) * 0.05; // ±2.5% micro changes
  
  const finalCount = Math.floor(baseViewers * timeMultiplier * popularityBonus * cycleFluctuation * microFluctuation);
  
  // Ensure minimum of 50 viewers for live matches
  return Math.max(50, Math.min(15000, finalCount)); // Cap at 15k to keep realistic
};

// Format viewer count for display
export const formatViewerCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};