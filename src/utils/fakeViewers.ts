// Enhanced fake viewer system with natural fluctuations - optimized for desktop performance
let lastUpdateTime = 0;
let cachedViewerCount = 0;
let baseViewerCount = 0;

export const generateFakeViewers = (matchTitle: string = ''): number => {
  const now = Date.now();
  
  // Reduce update frequency on desktop to prevent performance issues
  const isDesktop = window.innerWidth >= 1024;
  const updateInterval = isDesktop ? 10000 : 6000; // Longer intervals for desktop (10s vs 6s)
  
  // Return cached value if not enough time has passed
  if (now - lastUpdateTime < updateInterval && cachedViewerCount > 0) {
    return cachedViewerCount;
  }
  
  // Initialize base count if first time or reset after long period
  if (baseViewerCount === 0 || now - lastUpdateTime > 120000) { // 2 minute reset
    // Base viewer count influenced by match importance
    const isPopularMatch = matchTitle.toLowerCase().includes('barcelona') || 
                          matchTitle.toLowerCase().includes('real madrid') ||
                          matchTitle.toLowerCase().includes('manchester') ||
                          matchTitle.toLowerCase().includes('liverpool') ||
                          matchTitle.toLowerCase().includes('champions league');
    
    baseViewerCount = isPopularMatch ? 
      Math.floor(Math.random() * 2000) + 1000 : // 1000-3000 for popular
      Math.floor(Math.random() * 1000) + 300;   // 300-1300 for regular
  }
  
  // Smaller, more realistic fluctuations to reduce DOM updates
  const fluctuation = Math.floor(Math.random() * 60) - 30; // +/- 30 viewers
  
  cachedViewerCount = Math.max(100, baseViewerCount + fluctuation);
  lastUpdateTime = now;
  
  return cachedViewerCount;
};

// Compatibility alias for existing components
export const generateFakeViewerCount = (matchId: string, isLive: boolean = false): number => {
  if (!isLive) return 0;
  return generateFakeViewers(matchId);
};

// Format viewer count for display
export const formatViewerCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};