
export interface ManualMatchLink {
  id: string;
  name: string;
  url: string;
  quality?: string;
}

export interface ManualMatchSEO {
  keywords: string;
  description: string;
  category: string;
}

export interface ManualMatch {
  id: string;
  title: string;
  teams: {
    home: string;
    away: string;
  };
  date: string;
  Day?: string;
  visible: boolean;
  image?: string;
  links: ManualMatchLink[];
  seo?: ManualMatchSEO;
}
