interface CacheItem {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 60000; // 1 minute in-memory cache
const STORAGE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes localStorage cache

// In-memory cache for fast access
const memoryCache: Record<string, CacheItem> = {};

// Get from localStorage with expiry check
const getFromStorage = (key: string): any | null => {
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    if (Date.now() - parsed.timestamp > STORAGE_CACHE_DURATION) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

// Save to localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // localStorage might be full, ignore
  }
};

// Generate a cache key from URL
const getCacheKey = (url: string): string => {
  return url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
};

export const cachedFetch = async <T>(
  url: string, 
  options?: RequestInit,
  useLocalStorage = true
): Promise<T> => {
  const now = Date.now();
  const cacheKey = getCacheKey(url);
  
  // 1. Check in-memory cache first (fastest)
  if (memoryCache[url] && (now - memoryCache[url].timestamp) < CACHE_DURATION) {
    console.log('⚡ Using memory cache for:', url.substring(0, 50));
    return memoryCache[url].data;
  }
  
  // 2. Check localStorage cache (second fastest)
  if (useLocalStorage) {
    const storedData = getFromStorage(cacheKey);
    if (storedData) {
      console.log('💾 Using localStorage cache for:', url.substring(0, 50));
      // Also populate memory cache
      memoryCache[url] = { data: storedData, timestamp: now };
      return storedData;
    }
  }

  // 3. Fetch with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const data = await res.json();
    
    // Store in memory cache
    memoryCache[url] = { data, timestamp: now };
    
    // Store in localStorage for persistence
    if (useLocalStorage) {
      saveToStorage(cacheKey, data);
    }
    
    console.log('🌐 Fetched fresh data for:', url.substring(0, 50));
    return data;
  } catch (err) {
    clearTimeout(timeout);
    
    // Return cached data if available (even if stale)
    if (memoryCache[url]) {
      console.log('⚠️ Using stale memory cache for:', url.substring(0, 50));
      return memoryCache[url].data;
    }
    
    if (useLocalStorage) {
      // Try localStorage even if expired
      try {
        const stored = localStorage.getItem(`cache_${cacheKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('⚠️ Using stale localStorage cache for:', url.substring(0, 50));
          return parsed.data;
        }
      } catch {
        // Ignore
      }
    }
    
    throw err;
  }
};

// Preload function - call on page load for instant data
export const preloadData = (urls: string[]) => {
  urls.forEach(url => {
    cachedFetch(url).catch(() => {
      console.log('Preload failed for:', url.substring(0, 50));
    });
  });
};

// Clear all caches
export const clearCache = () => {
  Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
};

// Get cached data instantly without fetching (for initial render)
export const getCachedData = <T>(url: string): T | null => {
  const cacheKey = getCacheKey(url);
  
  // Check memory first
  if (memoryCache[url]) {
    return memoryCache[url].data;
  }
  
  // Check localStorage
  return getFromStorage(cacheKey);
};