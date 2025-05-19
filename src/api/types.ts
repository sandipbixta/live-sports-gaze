
// API Response Types
export interface StreamsApiResponse {
  success: boolean;
  timestamp: number;
  READ_ME: string;
  performance: number;
  streams: StreamCategory[];
}

export interface StreamCategory {
  category: string;
  id: number;
  always_live: number; // 0 = no, 1 = yes
  streams: StreamInfo[];
}

export interface StreamInfo {
  id: number;
  name: string;
  tag: string;
  poster: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number; // 0 = no, 1 = yes
  category_name: string;
  iframe?: string; // Optional iframe for direct embedding
  allowpaststreams: number; // 0 = no, 1 = yes
}
