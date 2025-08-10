
export interface Sport {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  badge?: string;
  logo?: string;
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
