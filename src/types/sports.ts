
export interface Sport {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  badge?: string;
  logo?: string;  // Adding logo property that's referenced in Match.tsx
}

export interface Source {
  source: string;
  id: string;
}

export interface Match {
  id: string;
  title: string;
  date: string;
  teams?: {
    home?: Team;
    away?: Team;
  };
  sources: Source[];
  related?: Match[]; // Related matches
  sportId?: string;  // Added sportId to identify which sport the match belongs to
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

// New interfaces for the streams API
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
  always_live: number;
  streams: StreamItem[];
}

export interface StreamItem {
  id: number;
  name: string;
  tag: string;
  poster: string;
  uri_name: string;
  starts_at: number;
  ends_at: number;
  always_live: number;
  category_name: string;
  iframe?: string;
  allowpaststreams: number;
}
