
// API Base URLs - using relative paths which will be proxied through our backend
export const API_BASE = '/api';
export const FALLBACK_API_BASE = '/api-fallback';  // Fallback API in case main API fails

// API endpoints
export const STREAMS_API = `${API_BASE}/streams`;
export const SPORTS_API = `${API_BASE}/sports`;
export const MATCHES_API = `${API_BASE}/matches`;
export const STREAM_API = `${API_BASE}/stream`;

// Request timeouts - increase timeout for slower connections
export const REQUEST_TIMEOUT = 20000; // 20 seconds

// Direct stream API endpoints (for proxying requests through our backend)
export const PROXY_STREAM_API = `/api/proxy-stream`;

// Additional API endpoints for specific match types
export const LIVE_MATCHES_API = `${API_BASE}/matches/live`;
export const ALL_MATCHES_API = `${API_BASE}/matches/all`;
export const TODAY_MATCHES_API = `${API_BASE}/matches/all-today`;
