interface CacheItem {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minute in-memory cache (faster refresh)
const STORAGE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes localStorage cache

// In-memory cache for fast access
const memoryCache: Record<string, CacheItem> = {};

// Pending requests to prevent duplicate fetches
const pendingRequests: Record<string, Promise<any>> = {};

// Get from localStorage with expiry check
const getFromStorage = (key: string): any | null => {
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Return data even if expired - we'll refresh in background
    return { data: parsed.data, isStale: Date.now() - parsed.timestamp > STORAGE_CACHE_DURATION };
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
    // localStorage might be full, clean old entries
    cleanOldCache();
  }
};

// Clean old cache entries
const cleanOldCache = () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
    // Remove oldest half of entries
    if (keys.length > 50) {
      keys.slice(0, 25).forEach(k => localStorage.removeItem(k));
    }
  } catch {
    // Ignore
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
    console.log('⚡ Memory cache hit:', url.substring(0, 50));
    return memoryCache[url].data;
  }
  
  // 2. Check localStorage cache
  if (useLocalStorage) {
    const storedResult = getFromStorage(cacheKey);
    if (storedResult) {
      console.log('💾 Storage cache hit:', url.substring(0, 50), storedResult.isStale ? '(stale)' : '');
      // Populate memory cache
      memoryCache[url] = { data: storedResult.data, timestamp: now };
      
      // If stale, fetch fresh data in background
      if (storedResult.isStale && !pendingRequests[url]) {
        fetchFreshData(url, options, cacheKey, useLocalStorage);
      }
      
      return storedResult.data;
    }
  }

  // 3. Check for pending request (prevent duplicate fetches)
  if (pendingRequests[url]) {
    console.log('⏳ Waiting for pending request:', url.substring(0, 50));
    return pendingRequests[url];
  }

  // 4. Fetch fresh data
  return fetchFreshData(url, options, cacheKey, useLocalStorage);
};

const fetchFreshData = async <T>(
  url: string,
  options?: RequestInit,
  cacheKey?: string,
  useLocalStorage = true
): Promise<T> => {
  const key = cacheKey || getCacheKey(url);
  
  // Create the fetch promise
  const fetchPromise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 sec timeout

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

      const data = await res.json();
      
      // Store in memory cache
      memoryCache[url] = { data, timestamp: Date.now() };
      
      // Store in localStorage
      if (useLocalStorage) {
        saveToStorage(key, data);
      }
      
      console.log('🌐 Fresh data fetched:', url.substring(0, 50));
      return data;
    } catch (err) {
      clearTimeout(timeout);
      
      // Return cached data if available (even if stale)
      if (memoryCache[url]) {
        console.log('⚠️ Using stale memory cache:', url.substring(0, 50));
        return memoryCache[url].data;
      }
      
      if (useLocalStorage) {
        try {
          const stored = localStorage.getItem(`cache_${key}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('⚠️ Using stale storage cache:', url.substring(0, 50));
            return parsed.data;
          }
        } catch {
          // Ignore
        }
      }
      
      throw err;
    } finally {
      delete pendingRequests[url];
    }
  })();

  pendingRequests[url] = fetchPromise;
  return fetchPromise;
};

// Preload function - call on page load for instant data
export const preloadData = (urls: string[]) => {
  urls.forEach(url => {
    cachedFetch(url).catch(() => {
      console.log('Preload failed:', url.substring(0, 50));
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
  const stored = getFromStorage(cacheKey);
  return stored?.data || null;
};

// Prefetch on idle - uses requestIdleCallback when available
export const prefetchOnIdle = (urls: string[]) => {
  const prefetch = () => preloadData(urls);
  
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(prefetch, { timeout: 3000 });
  } else {
    setTimeout(prefetch, 100);
  }
};