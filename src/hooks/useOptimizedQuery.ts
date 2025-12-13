import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Memory cache for instant data on re-renders
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const MEMORY_CACHE_DURATION = 60 * 1000; // 1 minute

// Get from memory cache
const getFromMemory = <T>(key: string): T | undefined => {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_DURATION) {
    return cached.data as T;
  }
  return undefined;
};

// Save to memory cache
const saveToMemory = (key: string, data: any) => {
  memoryCache.set(key, { data, timestamp: Date.now() });
};

// LocalStorage cache helpers
const getFromStorage = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Return data even if stale - we'll refresh in background
    return parsed.data as T;
  } catch {
    return null;
  }
};

const saveToStorage = (key: string, data: any, duration: number = 5 * 60 * 1000) => {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    }));
  } catch {
    // Storage full, ignore
  }
};

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> {
  cacheKey: string;
  storageDuration?: number; // How long to cache in localStorage (ms)
  enableStorage?: boolean; // Whether to use localStorage
}

export function useOptimizedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = { cacheKey: '' }
) {
  const { cacheKey, storageDuration = 5 * 60 * 1000, enableStorage = true, ...queryOptions } = options;
  
  // Try to get initial data from memory or storage
  const getCachedData = (): T | undefined => {
    // Try memory first (fastest)
    const memoryData = getFromMemory<T>(cacheKey);
    if (memoryData) {
      console.log(`⚡ Memory hit: ${cacheKey}`);
      return memoryData;
    }
    
    // Try localStorage (slower but persistent)
    if (enableStorage) {
      const storageData = getFromStorage<T>(cacheKey);
      if (storageData) {
        console.log(`💾 Storage hit: ${cacheKey}`);
        saveToMemory(cacheKey, storageData);
        return storageData;
      }
    }
    
    return undefined;
  };

  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      
      // Cache in memory
      saveToMemory(cacheKey, data);
      
      // Cache in localStorage
      if (enableStorage) {
        saveToStorage(cacheKey, data, storageDuration);
      }
      
      return data;
    },
    initialData: getCachedData,
    staleTime: storageDuration / 2, // Consider stale after half the cache duration
    ...queryOptions
  });
}

// Clear all caches
export const clearAllCaches = () => {
  memoryCache.clear();
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
};
