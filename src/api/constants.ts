
// API Base URLs - using both absolute and relative paths for better reliability
export const API_BASE = '/api';
export const FALLBACK_API_BASE = '/api-fallback';

// Direct API URLs - use these if the relative paths aren't working
export const DIRECT_API_BASE = 'https://api.example.com'; // Replace with your actual API endpoint
export const DIRECT_FALLBACK_API = 'https://backup-api.example.com'; // Replace with your actual backup API

// API endpoints
export const STREAMS_API = `${API_BASE}/streams`;
export const SPORTS_API = `${API_BASE}/sports`;
export const MATCHES_API = `${API_BASE}/matches`;
export const STREAM_API = `${API_BASE}/stream`;

// Request timeouts - increased for slower connections
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Direct stream API endpoints (for proxying requests)
export const PROXY_STREAM_API = `/api/proxy-stream`;

// Additional API endpoints for specific match types
export const LIVE_MATCHES_API = `${API_BASE}/matches/live`;
export const ALL_MATCHES_API = `${API_BASE}/matches/all`;
export const TODAY_MATCHES_API = `${API_BASE}/matches/all-today`;
