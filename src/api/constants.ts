
// API Base URLs
export const API_BASE = '/api';
export const FALLBACK_API_BASE = 'https://sports-api.backup-domain.com/api';

// API endpoints
export const STREAMS_API = `${API_BASE}/streams`;
export const SPORTS_API = `${API_BASE}/sports`;
export const MATCHES_API = `${API_BASE}/matches`;
export const STREAM_API = `${API_BASE}/stream`;

// Request timeouts
export const REQUEST_TIMEOUT = 15000; // 15 seconds

// Direct stream API endpoints (for proxying requests through our backend)
export const PROXY_STREAM_API = `/api/proxy-stream`;
