/**
 * Helper function to fetch streamed API via VPS proxy
 * All API calls go through /api/streamed/ which proxies to streamed.pk
 * This prevents EU buffering issues and improves reliability
 */
export async function streamedFetch<T = any>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    const response = await fetch(`/api/streamed/${cleanPath}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error('Streamed API fetch error:', err);
    return null;
  }
}

/**
 * Get full URL for streamed API images (badges, posters, proxied images)
 * These also go through the VPS proxy
 */
export function getStreamedImageUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If it's already a full URL, return as-is
  if (cleanPath.startsWith('http')) {
    return cleanPath;
  }
  
  return `/api/streamed/${cleanPath}`;
}
