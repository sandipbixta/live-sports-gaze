
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
  embedUrl?: string; // Direct embedding URL if provided by the API
  poster?: string;   // Added poster image URL from the streams API
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

// New interfaces for streams API usage
export interface ApiStreamsCategory {
  name: string;
  id: string;
  isAlwaysLive: boolean;
  streams: ApiStream[];
}

export interface ApiStream {
  id: string;
  name: string;
  tag: string;
  poster: string;
  uriName: string;
  startsAt: Date;
  endsAt: Date;
  isAlwaysLive: boolean;
  categoryName: string;
  iframe?: string;
  allowPastStreams: boolean;
}

